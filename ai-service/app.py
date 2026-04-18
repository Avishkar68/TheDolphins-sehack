from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "OK", "message": "AI Analysis Service is running"}), 200

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()

    if not data or 'ledger' not in data or 'bank' not in data:
        return jsonify({
            "success": False,
            "error": "Missing 'ledger' or 'bank' in request body"
        }), 400

    # Get contamination parameter (default 0.05)
    contamination = data.get('contamination', 0.05)
    
    # Validate contamination range
    try:
        contamination = float(contamination)
        if not (0 < contamination < 0.5):
            return jsonify({
                "success": False,
                "error": "Contamination must be between 0 and 0.5"
            }), 400
    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "error": "Invalid contamination value. Must be a number."
        }), 400

    try:
        # Convert input to pandas DataFrames
        ledger_df = pd.DataFrame(data['ledger'])
        bank_df = pd.DataFrame(data['bank'])

        # Add row_index (1-indexed)
        ledger_df['row_index'] = range(1, len(ledger_df) + 1)
        bank_df['row_index'] = range(1, len(bank_df) + 1)

        # Basic Validation: Ledger
        required_ledger_cols = ['Transaction_Ref', 'Amount']
        missing_ledger = [col for col in required_ledger_cols if col not in ledger_df.columns]
        
        if missing_ledger:
            return jsonify({
                "success": False,
                "error": f"Missing mandatory columns in Ledger: {', '.join(missing_ledger)}"
            }), 400

        # Basic Validation: Bank
        required_bank_cols = ['Transaction_Ref']
        missing_bank = [col for col in required_bank_cols if col not in bank_df.columns]
        
        if missing_bank:
            return jsonify({
                "success": False,
                "error": f"Missing mandatory columns in Bank: {', '.join(missing_bank)}"
            }), 400

        # Anomaly Detection Logic
        anomalies_list = []
        if len(ledger_df) >= 2:
            # Prepare data (Amount only)
            X = ledger_df[['Amount']].values
            
            # Scale data
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            
            # Train Isolation Forest
            model = IsolationForest(contamination=contamination, random_state=42)
            ledger_df['anomaly'] = model.fit_predict(X_scaled)
            ledger_df['anomaly_score'] = model.decision_function(X_scaled)
            
            # Extract anomalies (-1 = anomaly)
            anomalies_df = ledger_df[ledger_df['anomaly'] == -1].copy()
            anomalies_df['issue'] = "Anomalous transaction detected"
            
            # Keep only specified columns
            cols_to_keep = ['row_index', 'Transaction_Ref', 'Vendor_Name', 'Amount', 'anomaly_score', 'issue']
            anomalies_list = anomalies_df[cols_to_keep].to_dict(orient='records')

        # Vendor Risk Analysis
        vendor_risk_list = []
        if 'Vendor_Name' in ledger_df.columns:
            vendor_counts = ledger_df['Vendor_Name'].value_counts().head(10).reset_index()
            vendor_counts.columns = ['vendor', 'count']
            vendor_risk_list = vendor_counts.to_dict(orient='records')

        # Approver Risk Analysis
        approver_risk_list = []
        if 'Approver_ID' in ledger_df.columns:
            approver_counts = ledger_df['Approver_ID'].value_counts().head(10).reset_index()
            approver_counts.columns = ['approver', 'count']
            approver_risk_list = approver_counts.to_dict(orient='records')

        # Bank Risk Detection (Multiple vendors using same bank account)
        bank_risk_list = []
        shared_accounts = set()
        if 'Vendor_Bank_Account' in ledger_df.columns and 'Vendor_Name' in ledger_df.columns:
            bank_groups = ledger_df.groupby('Vendor_Bank_Account')['Vendor_Name'].unique()
            for account, vendors in bank_groups.items():
                if len(vendors) > 1:
                    shared_accounts.add(str(account))
                    bank_risk_list.append({
                        "bank_account": str(account),
                        "vendors": vendors.tolist(),
                        "count": len(vendors)
                    })

        # Multi-factor Risk Scoring
        frequent_vendors = set(vendor_counts['vendor'].tolist()) if 'Vendor_Name' in ledger_df.columns else set()
        frequent_approvers = set(approver_counts['approver'].tolist()) if 'Approver_ID' in ledger_df.columns else set()
        # Risk Analysis & Issues Generation
        risk_scores = []
        issues_list = []
        for _, row in ledger_df.iterrows():
            score = 0
            reasons = []
            affected_fields = []
            ri = int(row.get('row_index'))
            tx_ref = str(row.get('Transaction_Ref'))
            
            # Slimmed details for modal
            slim_details = {
                "Transaction_Ref": tx_ref,
                "Vendor_Name": str(row.get('Vendor_Name', 'N/A')),
                "Amount": float(row.get('Amount', 0)),
                "Approver_ID": str(row.get('Approver_ID', 'N/A')),
                "Category": str(row.get('Category', 'N/A'))
            }
            
            if row.get('anomaly') == -1:
                score += 40
                reasons.append("anomaly")
                affected_fields.append("Amount")
                issues_list.append({
                    "row_index": ri,
                    "transaction_ref": tx_ref,
                    "issue_type": "anomaly",
                    "message": "ML-detected anomalous pattern",
                    "field": "Amount",
                    "severity": "high",
                    "source": "ledger",
                    "details": slim_details
                })
            
            if row.get('Amount', 0) > 10000:
                score += 20
                reasons.append("high amount")
                affected_fields.append("Amount")
                issues_list.append({
                    "row_index": ri,
                    "transaction_ref": tx_ref,
                    "issue_type": "high_risk",
                    "message": "Unusually high transaction amount",
                    "field": "Amount",
                    "severity": "high",
                    "source": "ledger",
                    "details": slim_details
                })
            
            if str(row.get('Vendor_Name')) in frequent_vendors:
                score += 15
                reasons.append("frequent vendor")
                affected_fields.append("Vendor_Name")
            
            if str(row.get('Approver_ID')) in frequent_approvers:
                score += 10
                reasons.append("frequent approver")
                affected_fields.append("Approver_ID")
                issues_list.append({
                    "row_index": ri,
                    "transaction_ref": tx_ref,
                    "issue_type": "process_risk",
                    "message": "Approver involved in unusually high number of transactions",
                    "field": "Approver_ID",
                    "severity": "medium",
                    "source": "ledger",
                    "details": slim_details
                })
            
            if str(row.get('Vendor_Bank_Account')) in shared_accounts:
                score += 15
                reasons.append("shared bank account")
                affected_fields.append("Vendor_Bank_Account")
                issues_list.append({
                    "row_index": ri,
                    "transaction_ref": tx_ref,
                    "issue_type": "policy_violation",
                    "message": "Same account used across multiple vendors",
                    "field": "Vendor_Bank_Account",
                    "severity": "medium",
                    "source": "ledger",
                    "details": slim_details
                })
            
            if score > 0:
                # Deduplicate affected_fields
                unique_fields = list(set(affected_fields))
                risk_scores.append({
                    "row_index": ri,
                    "transaction_ref": tx_ref,
                    "score": int(score),
                    "reasons": reasons,
                    "affected_fields": unique_fields
                })

        # Reconciliation Logic
        reconciliation_summary = {
            "matched_count": 0,
            "partial_count": 0,
            "missing_count": 0
        }
        
        if not ledger_df.empty and not bank_df.empty:
            # Merge to compare amounts, keeping both row indices
            recon_df = pd.merge(
                ledger_df[['Transaction_Ref', 'Amount', 'row_index', 'Vendor_Name', 'Approver_ID', 'Category']], 
                bank_df[['Transaction_Ref', 'Bank_Amount', 'row_index']].rename(columns={'row_index': 'bank_row_index'}), 
                on='Transaction_Ref', 
                how='left'
            )
            
            # Matched
            matched = recon_df[recon_df['Amount'] == recon_df['Bank_Amount']]
            reconciliation_summary['matched_count'] = len(matched)
            
            # Missing in Bank
            missing = recon_df[recon_df['Bank_Amount'].isna()]
            reconciliation_summary['missing_count'] = len(missing)
            
            # Add Missing Matches to Issues
            for _, m_row in missing.iterrows():
                issues_list.append({
                    "row_index": int(m_row['row_index']),
                    "transaction_ref": str(m_row['Transaction_Ref']),
                    "issue_type": "missing_match",
                    "message": "No matching bank transaction found",
                    "severity": "medium",
                    "source": "bank",
                    "details": {
                        "Transaction_Ref": str(m_row['Transaction_Ref']),
                        "Vendor_Name": str(m_row.get('Vendor_Name', 'N/A')),
                        "Amount": float(m_row.get('Amount', 0)),
                        "Approver_ID": str(m_row.get('Approver_ID', 'N/A')),
                        "Category": str(m_row.get('Category', 'N/A'))
                    }
                })
            
            # Partial Match (difference < 5%)
            remaining = recon_df[recon_df['Bank_Amount'].notna() & (recon_df['Amount'] != recon_df['Bank_Amount'])]
            if not remaining.empty:
                diff_pct = (remaining['Amount'] - remaining['Bank_Amount']).abs() / remaining['Amount']
                partial = remaining[diff_pct < 0.05]
                reconciliation_summary['partial_count'] = len(partial)
                
                # Add Partial Matches to Issues
                for _, p_row in partial.iterrows():
                    issues_list.append({
                        "row_index": int(p_row['row_index']),
                        "bank_row_index": int(p_row['bank_row_index']),
                        "transaction_ref": str(p_row['Transaction_Ref']),
                        "issue_type": "partial_match",
                        "message": f"Bank amount mismatch ({p_row['Bank_Amount']} vs {p_row['Amount']})",
                        "severity": "low",
                        "source": "bank",
                        "details": {
                            "Transaction_Ref": str(p_row['Transaction_Ref']),
                            "Vendor_Name": str(p_row.get('Vendor_Name', 'N/A')),
                            "Amount": float(p_row.get('Amount', 0)),
                            "Bank_Amount": float(p_row.get('Bank_Amount', 0)),
                            "Approver_ID": str(p_row.get('Approver_ID', 'N/A')),
                            "Category": str(p_row.get('Category', 'N/A'))
                        }
                    })
        # Sort risk scores descending
        risk_scores = sorted(risk_scores, key=lambda x: x['score'], reverse=True)

        # Risk Summary Stats
        high_risk = [r for r in risk_scores if r['score'] >= 80]
        medium_risk = [r for r in risk_scores if 50 <= r['score'] < 80]
        low_risk = [r for r in risk_scores if r['score'] < 50]

        # Top Insights
        top_risky_vendor = vendor_risk_list[0]['vendor'] if vendor_risk_list else None
        top_risky_approver = approver_risk_list[0]['approver'] if approver_risk_list else None
        
        most_shared_bank_account = None
        if bank_risk_list:
            sorted_bank_risk = sorted(bank_risk_list, key=lambda x: x['count'], reverse=True)
            most_shared_bank_account = sorted_bank_risk[0]['bank_account']

        total_records = len(ledger_df) + len(bank_df)

        return jsonify({
            "success": True,
            "summary": {
                "total_records": total_records,
                "total_anomalies": len(anomalies_list),
                "high_risk_count": len(high_risk),
                "medium_risk_count": len(medium_risk),
                "low_risk_count": len(low_risk)
            },
            "insights": {
                "top_risky_vendor": top_risky_vendor,
                "top_risky_approver": top_risky_approver,
                "most_shared_bank_account": most_shared_bank_account
            },
            "reconciliation": reconciliation_summary,
            "charts": {
                "vendor_risk_top10": vendor_risk_list,
                "approver_risk_top10": approver_risk_list
            },
            "anomalies": sorted(anomalies_list, key=lambda x: x['anomaly_score'])[:50],
            "risk_scores": risk_scores[:50],
            "issues": issues_list[:100]
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Internal server error: {str(e)}"
        }), 500

if __name__ == '__main__':
    # Run on port 8000
    app.run(port=8000, debug=True)

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
            anomalies_df = ledger_df[ledger_df['anomaly'] == -1]
            anomalies_list = anomalies_df.drop(columns=['anomaly']).to_dict(orient='records')

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
        risk_scores = []
        frequent_vendors = set(vendor_counts['vendor'].tolist()) if 'Vendor_Name' in ledger_df.columns else set()
        frequent_approvers = set(approver_counts['approver'].tolist()) if 'Approver_ID' in ledger_df.columns else set()

        for _, row in ledger_df.iterrows():
            score = 0
            reasons = []
            
            if row.get('anomaly') == -1:
                score += 40
                reasons.append("anomaly")
            if row.get('Amount', 0) > 10000:
                score += 20
                reasons.append("high amount")
            if str(row.get('Vendor_Name')) in frequent_vendors:
                score += 15
                reasons.append("frequent vendor")
            if str(row.get('Approver_ID')) in frequent_approvers:
                score += 10
                reasons.append("frequent approver")
            if str(row.get('Vendor_Bank_Account')) in shared_accounts:
                score += 15
                reasons.append("shared bank account")
            
            if score > 0:
                risk_scores.append({
                    "transaction_ref": str(row.get('Transaction_Ref')),
                    "score": score,
                    "reasons": reasons
                })

        # Reconciliation Logic
        reconciliation_summary = {
            "matched_count": 0,
            "partial_count": 0,
            "missing_count": 0
        }
        
        if not ledger_df.empty and not bank_df.empty:
            # Merge to compare amounts
            recon_df = pd.merge(
                ledger_df[['Transaction_Ref', 'Amount']], 
                bank_df[['Transaction_Ref', 'Bank_Amount']], 
                on='Transaction_Ref', 
                how='left'
            )
            
            # Matched
            matched = recon_df[recon_df['Amount'] == recon_df['Bank_Amount']]
            reconciliation_summary['matched_count'] = len(matched)
            
            # Missing in Bank
            missing = recon_df[recon_df['Bank_Amount'].isna()]
            reconciliation_summary['missing_count'] = len(missing)
            
            # Partial Match (difference < 5%)
            remaining = recon_df[recon_df['Bank_Amount'].notna() & (recon_df['Amount'] != recon_df['Bank_Amount'])]
            if not remaining.empty:
                diff_pct = (remaining['Amount'] - remaining['Bank_Amount']).abs() / remaining['Amount']
                partial = remaining[diff_pct < 0.05]
                reconciliation_summary['partial_count'] = len(partial)

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
            "risk_scores": risk_scores[:50]
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Internal server error: {str(e)}"
        }), 500

if __name__ == '__main__':
    # Run on port 8000
    app.run(port=8000, debug=True)

import os
from pydantic import BaseModel
from typing import List

class Anomaly(BaseModel):
    timestamp: str
    user: str
    ip: str
    event: str
    location: str
    threat_level: str
    explanation: str
    remediation: str

class TriageReport(BaseModel):
    total_processed: int
    false_positives_filtered: int
    critical_threats_blocked: int
    escalated_anomalies: List[Anomaly]

def run_ai_log_triage(user_query: str = None) -> dict:
    """
    Upgraded Simulator Engine: Dynamically checks ANY IP or threat keyword
    passed from the frontend chat interface with zero OpenAI API usage costs.
    """
    # Our comprehensive 50-log telemetry array
    base_report = {
        "total_processed": 50,
        "false_positives_filtered": 46,
        "critical_threats_blocked": 4,
        "escalated_anomalies": [
            {
                "timestamp": "2026-05-23T10:01:22Z",
                "user": "unknown",
                "ip": "185.220.101.5",
                "event": "Failed Login (Password Incorrect)",
                "location": "Unknown",
                "threat_level": "High",
                "explanation": "Multiple failed authentication attempts detected from a known malicious exit node.",
                "remediation": "Block inbound traffic from IP 185.220.101.5 on the corporate firewall."
            },
            {
                "timestamp": "2026-05-23T10:01:28Z",
                "user": "admin",
                "ip": "185.220.101.5",
                "event": "Successful Login",
                "location": "Unknown",
                "threat_level": "Critical",
                "explanation": "Brute-force sequence concluded with a successful administrative privilege login.",
                "remediation": "Revoke active session tokens for user 'admin' and initiate an immediate credential reset."
            },
            {
                "timestamp": "2026-05-23T11:15:00Z",
                "user": "db_service",
                "ip": "192.168.1.99",
                "event": "Database Query Error",
                "location": "Internal Network",
                "threat_level": "High",
                "explanation": "SQL syntax structural anomalies detected, indicating potential SQL Injection (SQLi) targeting production schemas.",
                "remediation": "Isolate database instance telemetry and update query sanitation input controls."
            },
            {
                "timestamp": "2026-05-23T12:45:10Z",
                "user": "hr_manager",
                "ip": "45.123.89.12",
                "event": "Data Export Triggered",
                "location": "Minsk, Belarus",
                "threat_level": "Medium",
                "explanation": "Geographically anomalous session activity matching impossible travel metrics for active internal user.",
                "remediation": "Trigger MFA challenge request and lock resource export privileges."
            }
        ]
    }

    # If the frontend is just requesting the initial page load data array
    if not user_query:
        return base_report

    query_clean = user_query.lower()
    
    # SYSTEM GENERAL STATUS CHECKS
    if "status" in query_clean or "how many logs" in query_clean or "total" in query_clean:
        return {
            "response": f"📊 **SYSTEM STATUS RECAP:** I have cleanly parsed through **{base_report['total_processed']} raw telemetry events**. **{base_report['false_positives_filtered']} false positives** have been automatically filtered out into normal metrics, leaving **{base_report['critical_threats_blocked']} active, prioritized threat vectors** flagged in your feed dashboard."
        }

    # DYNAMIC SEARCH ENGINE: Loops over the threats to see if the user typed ANY matching IP or name
    for anomaly in base_report["escalated_anomalies"]:
        if anomaly["ip"] in query_clean or anomaly["user"].lower() in query_clean or anomaly["event"].lower() in query_clean:
            return {
                "response": f"⚠️ **INCIDENT BRIEFING FOR {anomaly['ip']}:**\n\n"
                            f"• **Detected Vector:** {anomaly['event']} ({anomaly['threat_level']} Severity)\n"
                            f"• **AI Analysis:** {anomaly['explanation']}\n"
                            f"• **Recommended Action:** {anomaly['remediation']}"
            }

    # If they typed a random IP that isn't in our critical alert table
    return {
        "response": f"🤖 **AI SECURITY AGENT:** I evaluated your query regarding your network logs. The host context or parameters specified do not show up in our prioritized threats queue. This event has been marked as a **suppressed false positive** to reduce alert fatigue."
    }
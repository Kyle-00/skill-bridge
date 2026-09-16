import base64
import requests
from requests.auth import HTTPBasicAuth
from datetime import datetime
from django.conf import settings


def get_access_token():
    """Fetch OAuth access token from Safaricom Daraja."""
    url = f"{settings.MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials"

    # Strip whitespace — Safaricom rejects keys with trailing spaces
    consumer_key = settings.MPESA_CONSUMER_KEY.strip()
    consumer_secret = settings.MPESA_CONSUMER_SECRET.strip()

    print(f"🔐 Requesting token with key: {consumer_key[:8]}... and secret: {consumer_secret[:8]}...")

    response = requests.get(
        url,
        auth=HTTPBasicAuth(consumer_key, consumer_secret),
        timeout=15,
    )

    print(f"📡 Token response: {response.status_code} — {response.text[:200]}")

    if response.status_code != 200:
        raise Exception(
            f"Failed to get token ({response.status_code}): {response.text}"
        )

    token = response.json().get('access_token')
    if not token:
        raise Exception(f"No access_token in response: {response.text}")

    return token


def stk_push(phone_number, amount, reference):
    """Initiate STK Push (Lipa Na M-Pesa Online)."""
    access_token = get_access_token()
    url = f"{settings.MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest"

    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    password_str = f"{settings.MPESA_SHORTCODE.strip()}{settings.MPESA_PASSKEY.strip()}{timestamp}"
    password = base64.b64encode(password_str.encode()).decode()

    payload = {
        'BusinessShortCode': settings.MPESA_SHORTCODE.strip(),
        'Password': password,
        'Timestamp': timestamp,
        'TransactionType': 'CustomerPayBillOnline',
        'Amount': int(amount),
        'PartyA': phone_number,
        'PartyB': settings.MPESA_SHORTCODE.strip(),
        'PhoneNumber': phone_number,
        'CallBackURL': settings.MPESA_CALLBACK_URL.strip(),
        'AccountReference': str(reference)[:12],  # Max 12 chars
        'TransactionDesc': 'SkillBridge Deposit',
    }
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
    }
    response = requests.post(url, json=payload, headers=headers, timeout=20)
    print(f"📤 STK push response: {response.status_code} — {response.text[:300]}")
    return response.json()


def b2c_payment(phone_number, amount, remarks='SkillBridge Withdrawal'):
    """Send money to a customer (B2C) — used for withdrawals."""
    access_token = get_access_token()
    url = f"{settings.MPESA_BASE_URL}/mpesa/b2c/v1/paymentrequest"

    payload = {
        'InitiatorName': getattr(settings, 'MPESA_INITIATOR_NAME', 'testapi'),
        'SecurityCredential': getattr(settings, 'MPESA_SECURITY_CREDENTIAL', ''),
        'CommandID': 'BusinessPayment',
        'Amount': int(amount),
        'PartyA': settings.MPESA_SHORTCODE.strip(),
        'PartyB': phone_number,
        'Remarks': remarks,
        'QueueTimeOutURL': f"{settings.MPESA_CALLBACK_URL.strip()}b2c-timeout/",
        'ResultURL': f"{settings.MPESA_CALLBACK_URL.strip()}b2c-result/",
        'Occasion': 'Withdrawal',
    }
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
    }
    return requests.post(url, json=payload, headers=headers, timeout=20).json()
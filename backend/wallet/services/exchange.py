import requests
from decimal import Decimal
from django.core.cache import cache

# Fallback if API is unavailable
FALLBACK_USD_TO_KES = Decimal('130.00')


def get_usd_to_kes_rate():
    """
    Fetch live USD → KES rate. Cached for 1 hour.
    Uses exchangerate-api.com (free tier, no key needed for base).
    Falls back to a static rate if the API fails.
    """
    cached = cache.get('usd_to_kes')
    if cached:
        return Decimal(str(cached))

    try:
        response = requests.get(
            'https://open.er-api.com/v6/latest/USD',
            timeout=5,
        )
        if response.status_code == 200:
            data = response.json()
            rate = data.get('rates', {}).get('KES')
            if rate:
                cache.set('usd_to_kes', rate, 3600)  # cache 1 hour
                return Decimal(str(rate))
    except Exception as e:
        print(f' Exchange rate fetch failed: {e}')

    return FALLBACK_USD_TO_KES


def usd_to_kes(usd_amount):
    """Convert USD to KES."""
    rate = get_usd_to_kes_rate()
    return int(Decimal(str(usd_amount)) * rate)


def kes_to_usd(kes_amount):
    """Convert KES to USD."""
    rate = get_usd_to_kes_rate()
    return round(Decimal(str(kes_amount)) / rate, 2)
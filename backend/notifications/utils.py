from notifications.models import Notification


def notify(recipient, actor, verb, message, target=''):
    """
    Create a notification. Safe to call anywhere — swallows errors so
    notification failures never break the main request flow.
    """
    try:
        Notification.objects.create(
            recipient=recipient,
            actor=actor,
            verb=verb,
            message=message,
            target=target,
        )
    except Exception as e:
        print(f'Notification failed: {e}')
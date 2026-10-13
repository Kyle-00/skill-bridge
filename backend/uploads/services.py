import os
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import uuid

def save_upload(file_obj, folder='uploads'):
    """
    Saves an uploaded file to the configured storage backend.
    Returns the URL of the saved file.
    """
    # Generate a unique filename to prevent overwrites
    ext = os.path.splitext(file_obj.name)[1]
    filename = f"{folder}/{uuid.uuid4().hex}{ext}"
    
    # Save the file using Django's default storage system
    saved_path = default_storage.save(filename, ContentFile(file_obj.read()))
    
    # Return the URL
    return default_storage.url(saved_path)
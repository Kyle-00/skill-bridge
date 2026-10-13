from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.files.storage import default_storage
from django.conf import settings

MAX_SIZE = 25 * 1024 * 1024  # 25 MB
ALLOWED = {
    'image': {'image/jpeg', 'image/png', 'image/webp', 'image/gif'},
    'document': {'application/pdf', 'text/plain', 'application/zip',
                 'application/msword',
                 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'},
    'video': {'video/mp4', 'video/webm'},
    'any': set(),
}


class UploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('file')
        purpose = request.data.get('purpose', 'any')
        if not file:
            return Response({'error': 'No file provided.'}, status=400)
        if file.size > MAX_SIZE:
            return Response({'error': 'File exceeds 25 MB limit.'}, status=400)

        allowed = ALLOWED.get(purpose, set())
        if allowed and file.content_type not in allowed:
            return Response(
                {'error': f'{file.content_type} not allowed for purpose "{purpose}".'},
                status=400,
            )

        folder = f'{purpose}s/{request.user.id}'
        path = default_storage.save(f'{folder}/{file.name}', file)
        url = default_storage.url(path)
        if url.startswith('/'):
            url = f'{settings.BACKEND_ORIGIN or ""}{url}'
        return Response({'url': url, 'name': file.name, 'size': file.size})
import os
import requests
from fastapi import Request, HTTPException, status, Depends

# Django backend URL (adjust if needed)
DJANGO_API_URL = os.getenv("DJANGO_API_URL", "http://localhost:8000")


def get_django_sessionid(request: Request):
    # Django session cookie is usually named 'sessionid'
    return request.cookies.get("sessionid")


def validate_django_session_and_group(request: Request):
    sessionid = get_django_sessionid(request)
    if not sessionid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated (no sessionid)")

    # Call Django backend to validate session and get user info
    try:
        resp = requests.get(
            f"{DJANGO_API_URL}/api/users/me/",
            cookies={"sessionid": sessionid},
            timeout=3
        )
        if resp.status_code == 200:
            user = resp.json()
            # Check if user is in '4syz' group
            groups = user.get("groups", [])
            if "4syz" not in groups:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not in required group: 4syz")
            return user  # user info
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Auth service error: {e}")


def get_current_4syz_user(request: Request):
    return validate_django_session_and_group(request) 
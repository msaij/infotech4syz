# backend dockerfile

FROM python:3.9.23

COPY ./backend ./backend

# set working directory
WORKDIR /backend

RUN pip install -r requirements.txt

# CMD [ "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
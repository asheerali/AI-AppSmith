FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy requirements (if exists)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire project (adjust if needed)
COPY . .

# Change working directory to backend
WORKDIR /app/backend


# Expose port 8000
EXPOSE 5000

# Command to run the backend
CMD ["uvicorn", "main:app", "--reload" , "--host", "0.0.0.0", "--port", "5000"]
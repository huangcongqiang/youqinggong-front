#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RELEASE_DIR="${ROOT_DIR}/release"

echo "[1/5] Cleaning release directory"
rm -rf "${RELEASE_DIR}"
mkdir -p "${RELEASE_DIR}/frontend" "${RELEASE_DIR}/admin" "${RELEASE_DIR}/backend"

echo "[2/5] Building frontend"
cd "${ROOT_DIR}/frontend"
npm install
npm run build
cp -R dist/. "${RELEASE_DIR}/frontend/"

echo "[3/5] Building admin"
cd "${ROOT_DIR}/admin"
npm install
npm run build
cp -R dist/. "${RELEASE_DIR}/admin/"

echo "[4/5] Building spring-app"
cd "${ROOT_DIR}/backend/spring-app"
mvn clean package -DskipTests

JAR_FILE="$(find target -maxdepth 1 -type f -name '*.jar' ! -name '*original*.jar' | head -n 1)"
if [[ -z "${JAR_FILE}" ]]; then
  echo "No Spring Boot jar found in backend/spring-app/target"
  exit 1
fi
cp "${JAR_FILE}" "${RELEASE_DIR}/backend/app.jar"

echo "[5/5] Copying deployment templates"
cp -R "${ROOT_DIR}/deploy" "${RELEASE_DIR}/deploy"

echo "Release package created at: ${RELEASE_DIR}"

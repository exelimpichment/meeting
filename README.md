# Meeting platform deployment

## Container images
- Each Nest app keeps its Dockerfile under `apps/<service>/Dockerfile`.
- Images are multi-stage builds that compile the specific service (`pnpm nest build <service>`) and copy only the compiled `dist` bundle plus production dependencies.
- Build arguments allow switching the base Node image via `NODE_VERSION` if required.

## Kubernetes manifests
- Base manifests live in `k8s/<service>/deployment.yaml` and bundle both the `Deployment` and `Service` objects.
- The manifests expect per-service `ConfigMap`/`Secret` pairs (e.g. `meeting-api-gateway-config`, `meeting-api-gateway-secrets`) to provide database URLs, Kafka/NATS endpoints, and JWT material.
- Update the image registry placeholders (`REGION-docker.pkg.dev/PROJECT_ID/...`) if you deploy outside the GitHub Actions workflow.

## GitHub Actions workflow
- `.github/workflows/build-deploy.yml` runs on pushes to `main` and can be launched manually via **workflow_dispatch**.
- `dorny/paths-filter` tracks changes per service directory (`apps/<service>` and `k8s/<service>`). Shared changes (e.g. in `libs/`, `package.json`, or the workflow itself) trigger rebuilds for every service to keep deployments consistent.
- If no tracked paths change, the workflow short-circuits and skips the build/deploy job.
- Manual redeploys: trigger the workflow from the Actions tab and provide `services` input as a comma-separated list (`meeting-api-gateway,messenger`) or `all` to force every service to rebuild.

## GCP prerequisites
- Images push to Artifact Registry and workloads deploy to GKE via Workload Identity Federation.
- Required secrets/variables and bootstrap steps are described in `infra/gcp/README.md`.
- Ensure the referenced namespace plus ConfigMaps/Secrets already exist before running the workflow so `kubectl apply` succeeds.

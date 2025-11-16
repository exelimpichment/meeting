# GCP deployment prerequisites

This repo deploys each Nest microservice to Google Kubernetes Engine (GKE) with container images stored in Artifact Registry. Complete the following bootstrap steps before running the GitHub Actions workflow.

## 1. Create infrastructure primitives

1. Enable the required APIs:
   - `artifactregistry.googleapis.com`
   - `container.googleapis.com`
2. Create an Artifact Registry repository (type `docker`) that will hold all microservice images, for example:
   ```
   gcloud artifacts repositories create meeting \
     --repository-format=docker \
     --location=us-central1
   ```
3. Provision a GKE cluster (Autopilot or standard) in your target region/zone. Record its name and location for later.

## 2. Configure Workload Identity Federation

1. Create a GCP service account, e.g. `meeting-cicd@<PROJECT_ID>.iam.gserviceaccount.com`.
2. Grant it the following roles (scope it to the project unless otherwise noted):
   - `roles/artifactregistry.writer`
   - `roles/container.clusterAdmin`
   - `roles/container.developer`
   - `roles/iam.serviceAccountTokenCreator`
3. Create a Workload Identity Pool and Provider that trusts your GitHub repository.
4. Bind the service account to the provider:
   ```
   gcloud iam service-accounts add-iam-policy-binding meeting-cicd@<PROJECT_ID>.iam.gserviceaccount.com \
     --role roles/iam.workloadIdentityUser \
     --member "principalSet://iam.googleapis.com/projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/<POOL_ID>/attribute.repository/<OWNER>/<REPO>"
   ```

## 3. Required GitHub secrets/variables

Set these repository-level secrets or variables so the workflow can authenticate and target the right cluster:

| Name                             | Type       | Description                                                                                                                                 |
| -------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `GCP_PROJECT_ID`                 | `secret`   | Google Cloud project that hosts Artifact Registry and GKE                                                                                   |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | `secret`   | Full resource ID of the Workload Identity Provider (`projects/<NUMBER>/locations/global/workloadIdentityPools/<POOL>/providers/<PROVIDER>`) |
| `GCP_SERVICE_ACCOUNT`            | `secret`   | Email of the federated service account (`meeting-cicd@...`)                                                                                 |
| `GKE_CLUSTER`                    | `variable` | Name of the GKE cluster that hosts the workloads                                                                                            |
| `GKE_LOCATION`                   | `variable` | Region or zone of the cluster (e.g. `us-central1`)                                                                                          |
| `GAR_LOCATION`                   | `variable` | Artifact Registry region used for images (e.g. `us-central1`)                                                                               |
| `GAR_REPOSITORY`                 | `variable` | Artifact Registry repository name (e.g. `meeting`)                                                                                          |
| `GKE_NAMESPACE`                  | `variable` | Kubernetes namespace to deploy into (defaults to `default` if omitted)                                                                      |

> tip: use GitHub _Actions secrets_ for anything sensitive (project id, provider id, service account) and _Actions variables_ for non-sensitive settings such as cluster names.

## 4. Manual namespace/config prerequisites

Before the workflow deploys, ensure that:

- The target namespace exists (`kubectl create ns <name>`).
- ConfigMaps/Secrets referenced in `k8s/*/deployment.yaml` are created in that namespace with the right connection strings (database URLs, Kafka brokers, JWT keys, etc.).
- The cluster can reach external dependencies (MySQL, Kafka, NATS, Redis); provision managed services or deploy them separately.

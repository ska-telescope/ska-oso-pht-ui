# SKA Proposal Handling Tool (PHT) UI

## Overview

This repository contains the **Proposal Handling Tool (PHT) UI**, a modular federated React application used to create, edit and submit observation submissions within the SKAO ecosystem.

The UI integrates with:

- **ska-oso-services** (proposal lifecycle and submission APIs)
- **ska-ost-senscalc** (sensitivity calculator backend)
- SKAO authentication (MS Entra / login app)

This repository is intended primarily for **developers running the UI locally**, typically alongside backend services deployed in Minikube.

---

## Project Status

In development.

## Architecture (High Level)

```
Browser -> PHT UI (this repo)  -> ska-oso-services (proposal APIs)
                               -> ska-ost-senscalc (observation calculations)
```

The PHT requires reachable backend services to function correctly.

---

# Prerequisites

Before running locally, ensure you have:

- Node.js (recommended LTS)
- Yarn (classic v1)
- Git
- Access to running:

  - `ska-oso-services`
  - `ska-ost-senscalc`

If using Minikube:

minikube ip
You will need the returned IP for your `.env` configuration.

# Quick Start (Local Development)

This assumes:

- You have deployed **ska-oso-services** and **ska-ost-senscalc**
- They are accessible via Minikube

## 1. Clone the repository

git clone https://gitlab.com/ska-telescope/oso/ska-oso-pht-ui.git
cd ska-oso-pht-ui

## 2. Initialize submodules

This project uses git submodules:

git submodule update --init --recursive
git submodule update --recursive --remote

## 3. Install dependencies

yarn

## 4. Configure Environment

Create a `.env` file in the project root.

### Example `.env`

```env
SKIP_PREFLIGHT_CHECK=true

REACT_APP_SKA_PHT_BASE_URL=''

REACT_APP_SKA_OSO_SERVICES_URL='http://192.168.49.2/ska-oso-services/oso/api/v12'
REACT_APP_SKA_SENSITIVITY_CALC_URL='http://192.168.49.2/ska-ost-senscalc/api/v11/'

REACT_APP_USE_LOCAL_DATA_SENSITIVITY_CALC=false
REACT_APP_USE_LOCAL_DATA=false

REACT_APP_DOMAIN='https://sdhp.stfc.skao.int'
REACT_APP_SKA_LOGIN_APP_URL='http://localhost:4201'

```

### Environment Variable Explanation

| Variable                                    | Purpose                                   |
| ------------------------------------------- | ----------------------------------------- |
| `REACT_APP_SKA_OSO_SERVICES_URL`            | Base URL for proposal backend APIs        |
| `REACT_APP_SKA_SENSITIVITY_CALC_URL`        | Sensitivity calculator backend            |
| `REACT_APP_USE_LOCAL_DATA`                  | Use mock proposal data instead of backend |
| `REACT_APP_USE_LOCAL_DATA_SENSITIVITY_CALC` | Use mock sensitivity calculator data      |
| `REACT_APP_DOMAIN`                          | Domain used for authentication            |
| `REACT_APP_SKA_LOGIN_APP_URL`               | Login application URL                     |

If using Minikube, ensure the IP matches the output of `minikube ip`.

## 5. Generate `env.js` and Start the Application

For local development, `env.js` must be located in the `public/` folder.

Run:

yarn dev

This:

- Generates `public/env.js` from your `.env`
- Starts the development server

The UI should now be available at:

http://localhost:6101/

## Alternative Start Command

yarn local

This runs the application **without regenerating** `public/env.js`.

Use this if you do not want your existing `env.js` overwritten.

# Backend Requirements

The UI requires the following services to be reachable:

- `ska-oso-services`
- `ska-ost-senscalc`

Please refer to their respective documentation for setup instructions.

If the UI fails to load data:

- Verify backend URLs in `.env`
- Confirm Minikube IP
- Ensure API versions (`v12`, `v11`) match deployed services

# Git Hooks (Pre-Commit Checks)

To enable local pre-commit checks:

git config --local core.hooksPath resources/git-hooks

Project repository-provided git hooks.

# Redux Usage (Developer Notes)

The following global state is stored in Redux:

| Store Path             | Purpose                                    |
| ---------------------- | ------------------------------------------ |
| `Application.Content1` | Proposal status per page                   |
| `Application.Content2` | Currently edited proposal                  |
| `Application.Content3` | Original loaded proposal (for comparison)  |
| `Application.Content4` | `ProposalAccess[]`, used during submission |
| `Application.Content5` | Global notifications                       |
| `Application.Content6` | Not used                                   |
| `Application.Content7` | Not used                                   |
| `Application.Content8` | Not used                                   |
| `Application.Content9` | Not used                                   |
| `Help.component`       | Field-dependent help information           |

# Documentation

Latest project documentation is available on ReadTheDocs:

https://developer.skao.int/projects/ska-oso-pht-ui/en/latest/?badge=latest

# Contributing

Contributions are welcome.

Please refer to the SKAO Developer Portal:

https://developer.skao.int/en/latest/

# Notes

- Refer to **oso-services documentation** for required backend implementation details.
- Refer to **ska-ost-senscalc documentation** for observation backend setup.
- Contact maintainers for required MS Entra authentication environment variables.

# Troubleshooting

### UI shows blank page

- Ensure `public/env.js` exists
- Check browser console for missing backend URL errors

### API requests failing

- Verify Minikube IP has not changed
- Confirm backend services are running
- Confirm API versions match

### Authentication issues

- Verify `REACT_APP_DOMAIN`
- Confirm login app is reachable
- Ensure correct MS Entra configuration

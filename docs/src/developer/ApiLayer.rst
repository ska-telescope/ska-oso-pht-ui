API Layer
~~~~~~~~~

Every call to ska-oso-services goes through the API layer in ``src/services/api``. It is a thin
layer on the OpenAPI client generated into ``src/generated``, so each call follows one pattern.

Layers
======

.. code-block:: text

   src/generated                   generated client: transport and PDM types, never edited
      ↓
   src/services/api/<domain>.ts    thin: call a generated method, map the response, return ApiResult
      ↓
   src/models/<domain>             app models and pure PDM ↔ model mappers; no I/O, no React
      ↓
   hooks / pages / components      UI: state, notifications, the proposal form

Rules
=====

``src/services/api``

* No React, store, i18n or UI code. The exceptions are the auth hooks in ``auth.ts`` and
  ``useAxiosInterceptor.ts``.
* Every exported call returns ``Promise<ApiResult<T>>`` (``{ data?, error? }``) and never throws.
  Wrap the call in ``callApi`` (``apiResult.ts``), which:

  * maps a thrown error with ``handleApiError``;
  * treats a missing response body as ``UNKNOWN_API_ERROR`` (pass ``allowEmpty`` for a 204);
  * returns an error result if the mapper throws.
* Name calls for what they do, e.g. ``listMyProposals``, ``updateReview``.
* Don't build URLs by hand. Use the generated factory instances in ``client.ts`` (``api.*``).

``src/models/<domain>``

* Types, plus ``xFromPdm`` / ``xToPdm`` mappers. These are pure and tested directly.
* Test fixtures go in a ``testing/`` folder next to the models.

Callers

* Don't import ``@/generated`` or axios.
* Don't handle tokens: authentication is applied centrally (see below).
* Handle both ``data`` and ``error`` from the result.

Proposal editor
===============

The proposal editor's calls (``getProposal``, ``updateProposal``, ``createProposal`` and
``validateProposal`` in ``proposals.ts``) send and receive the proposal's PDM. The services add
only the save metadata (status, submitted on / by).

Mapping between the form and the PDM is done by ``useProposalOda``
(``src/models/proposals/useProposalOda.ts``), using ``pdmMapper``. This includes the rules for a
new proposal, such as clearing stale sensitivity results and making investigators pending. See
:doc:`ProposalEditor`.

Authentication
==============

* **Authenticated calls** go through the global axios instance, which ``api`` uses.
  ``useAxiosInterceptor`` (mounted once in ``PHT.tsx``) adds the user's MSAL token to every
  request. On localhost it also registers the token provider used by ``publicAxios``.
* **Public calls**, such as target name resolution, the visibility plot and the sensitivity
  calculator, use ``publicAxios`` (``publicApi`` for the generated methods). This instance has
  no auth interceptor, so these pages work when no one is logged in.
* **Signed S3 URLs**, for PDF upload and delete, use their own plain axios instance in
  ``documents.ts``, so the user's token is never sent to S3.

Testing
=======

* **Service tests:** mock ``./client`` (``api``) and check what the call sends and how it
  reads the response. For example, see ``proposals.test.tsx``.
* **Caller tests:** mock the domain module, e.g. ``vi.mock('@/services/api/panels')``.
* **Mapper tests:** call the mapper directly with the fixtures in ``testing/``.

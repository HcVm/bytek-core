/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agile from "../agile.js";
import type * as auth from "../auth.js";
import type * as clientPortal from "../clientPortal.js";
import type * as clients from "../clients.js";
import type * as departments from "../departments.js";
import type * as documents from "../documents.js";
import type * as fieldService from "../fieldService.js";
import type * as finance from "../finance.js";
import type * as hr from "../hr.js";
import type * as http from "../http.js";
import type * as internalRequests from "../internalRequests.js";
import type * as inventory from "../inventory.js";
import type * as invoices from "../invoices.js";
import type * as legal from "../legal.js";
import type * as metrics from "../metrics.js";
import type * as opportunities from "../opportunities.js";
import type * as packages from "../packages.js";
import type * as projects from "../projects.js";
import type * as quotes from "../quotes.js";
import type * as reports from "../reports.js";
import type * as risks from "../risks.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agile: typeof agile;
  auth: typeof auth;
  clientPortal: typeof clientPortal;
  clients: typeof clients;
  departments: typeof departments;
  documents: typeof documents;
  fieldService: typeof fieldService;
  finance: typeof finance;
  hr: typeof hr;
  http: typeof http;
  internalRequests: typeof internalRequests;
  inventory: typeof inventory;
  invoices: typeof invoices;
  legal: typeof legal;
  metrics: typeof metrics;
  opportunities: typeof opportunities;
  packages: typeof packages;
  projects: typeof projects;
  quotes: typeof quotes;
  reports: typeof reports;
  risks: typeof risks;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accounting from "../accounting.js";
import type * as adminCommunications from "../adminCommunications.js";
import type * as agile from "../agile.js";
import type * as analytics from "../analytics.js";
import type * as assets from "../assets.js";
import type * as auth from "../auth.js";
import type * as authorization from "../authorization.js";
import type * as budgets from "../budgets.js";
import type * as clientPortal from "../clientPortal.js";
import type * as clients from "../clients.js";
import type * as contracts from "../contracts.js";
import type * as daily from "../daily.js";
import type * as dashboard from "../dashboard.js";
import type * as departments from "../departments.js";
import type * as documents from "../documents.js";
import type * as exchangeRates from "../exchangeRates.js";
import type * as fieldService from "../fieldService.js";
import type * as finance from "../finance.js";
import type * as financialStatements from "../financialStatements.js";
import type * as hr from "../hr.js";
import type * as http from "../http.js";
import type * as internalRequests from "../internalRequests.js";
import type * as inventory from "../inventory.js";
import type * as invoices from "../invoices.js";
import type * as journal from "../journal.js";
import type * as legal from "../legal.js";
import type * as metrics from "../metrics.js";
import type * as opportunities from "../opportunities.js";
import type * as packages from "../packages.js";
import type * as payables from "../payables.js";
import type * as projects from "../projects.js";
import type * as quotes from "../quotes.js";
import type * as receivables from "../receivables.js";
import type * as reports from "../reports.js";
import type * as risks from "../risks.js";
import type * as supportTickets from "../supportTickets.js";
import type * as talent from "../talent.js";
import type * as taxManagement from "../taxManagement.js";
import type * as timeEntries from "../timeEntries.js";
import type * as treasury from "../treasury.js";
import type * as users from "../users.js";
import type * as vendors from "../vendors.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accounting: typeof accounting;
  adminCommunications: typeof adminCommunications;
  agile: typeof agile;
  analytics: typeof analytics;
  assets: typeof assets;
  auth: typeof auth;
  authorization: typeof authorization;
  budgets: typeof budgets;
  clientPortal: typeof clientPortal;
  clients: typeof clients;
  contracts: typeof contracts;
  daily: typeof daily;
  dashboard: typeof dashboard;
  departments: typeof departments;
  documents: typeof documents;
  exchangeRates: typeof exchangeRates;
  fieldService: typeof fieldService;
  finance: typeof finance;
  financialStatements: typeof financialStatements;
  hr: typeof hr;
  http: typeof http;
  internalRequests: typeof internalRequests;
  inventory: typeof inventory;
  invoices: typeof invoices;
  journal: typeof journal;
  legal: typeof legal;
  metrics: typeof metrics;
  opportunities: typeof opportunities;
  packages: typeof packages;
  payables: typeof payables;
  projects: typeof projects;
  quotes: typeof quotes;
  receivables: typeof receivables;
  reports: typeof reports;
  risks: typeof risks;
  supportTickets: typeof supportTickets;
  talent: typeof talent;
  taxManagement: typeof taxManagement;
  timeEntries: typeof timeEntries;
  treasury: typeof treasury;
  users: typeof users;
  vendors: typeof vendors;
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

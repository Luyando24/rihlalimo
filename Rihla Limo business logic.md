Business name used throughout: Rihla Limo

Rihla Limo

Enterprise Limo Service Platform

Technical Requirements & System Specification

1\. Overview

Client: Rihla Limo  
Industry: Luxury Chauffeur & Limousine Services  
Objective:  
Design and develop a full-scale, enterprise-grade limo operations platform, where the public website is the entry point to a complete system including booking, dispatch, driver management, CRM, payments, analytics, and future mobile expansion.

This is not a marketing-only website.

2\. System Architecture

2.1 General Architecture  
	•	API-first architecture  
	•	Modular & scalable  
	•	Cloud-based deployment  
	•	Separation of concerns:  
	•	Frontend (Customer-facing website & portals)  
	•	Backend (Business logic & integrations)  
	•	Database layer  
	•	External APIs

2.2 Recommended Stack (or equivalents)  
	•	Frontend: React / Next.js  
	•	Backend: Node.js (NestJS) or Laravel  
	•	Database: PostgreSQL \+ Redis (caching)  
	•	Hosting: AWS / GCP  
	•	Maps: Google Maps or Mapbox  
	•	Messaging: Twilio (SMS/WhatsApp), Email API  
	•	Payments: Stripe

3\. User Roles & Permissions

Roles  
	•	Super Admin  
	•	Admin / Operations Manager  
	•	Dispatcher  
	•	Driver  
	•	Client (Individual)

Role-Based Access Control (RBAC)  
	•	Granular permissions  
	•	Audit logging for admin actions  
	•	Secure authentication (JWT / OAuth)

4\. Public Website (Frontend)

Core Pages  
	•	Home  
	•	Fleet (dynamic vehicle listing)  
	•	Services  
	•	Airports  
	•	Corporate Services  
	•	Events  
	•	Cities / Service Areas  
	•	About  
	•	Contact  
	•	Instant Quote & Booking

Technical Requirements  
	•	Fully responsive  
	•	SEO-optimized  
	•	Fast load times (Core Web Vitals)  
	•	Schema markup for limo services  
	•	Multi-language ready (future expansion)

5\. Booking & Quotation Engine

Booking Types  
	•	Airport Transfers  
	•	Point-to-Point  
	•	Hourly Charter  
	•	Multi-stop  
	•	Multi-day  
	•	Events & Weddings  
	•	Corporate Accounts

Quote Logic  
	•	Distance \+ time calculation  
	•	Hourly minimum enforcement  
	•	Peak pricing rules  
	•	Vehicle-based pricing  
	•	Event/date-based surcharges  
	•	Promo codes  
	•	Return trip logic  
	•	Buffer time automation

Booking Flow  
	1\.	Quote  
	2\.	Vehicle selection  
	3\.	Passenger details  
	4\.	Payment / Deposit  
	5\.	Confirmation  
	6\.	Notifications

6\. Dispatch & Operations Module

Dispatcher Dashboard  
	•	Real-time vehicle map  
	•	Manual & auto driver assignment  
	•	Job status tracking:  
	•	Unassigned  
	•	Assigned  
	•	En route  
	•	Arrived  
	•	Client onboard  
	•	Completed  
	•	Conflict detection  
	•	Delay alerts

Integrations  
	•	Flight tracking API (automatic ETA updates)  
	•	Geo-fencing (arrival notifications)

7\. Driver Portal

Driver Capabilities  
	•	Secure login  
	•	Job list with navigation  
	•	Status updates (one-click)  
	•	Client notes  
	•	Document uploads  
	•	Availability scheduling  
	•	Earnings overview  
	•	Tip reporting

(Must be mobile-responsive; app-ready)

8\. Client Portal (Premium Experience)

Individual Clients  
	•	Booking history  
	•	Saved locations  
	•	Favorite vehicles  
	•	Live ride tracking  
	•	Invoices & receipts  
	•	Chauffeur details

Corporate Clients  
	•	Multiple riders under one account  
	•	Approval workflows  
	•	Monthly invoicing  
	•	Cost center tagging  
	•	Usage reports

9\. Payments & Financial System

Payment Features  
	•	Credit/Debit cards  
	•	Apple Pay / Google Pay  
	•	Deposits \+ remaining balance  
	•	Gratuity presets  
	•	Cancellation fee rules  
	•	Refund automation

Accounting  
	•	Driver payout calculations  
	•	Exportable financial reports  
	•	QuickBooks / Xero integration (optional phase)

10\. CRM & Automation

CRM Features  
	•	Client profiles  
	•	Ride frequency & lifetime value  
	•	Tags (VIP, Corporate, Frequent)  
	•	Notes & preferences  
	•	Reminder triggers

Automated Communication  
	•	Booking confirmation  
	•	Driver en-route notifications  
	•	Post-ride feedback  
	•	Loyalty offers  
	•	Review requests

11\. Admin & Analytics Dashboard

KPIs  
	•	Revenue by vehicle  
	•	Utilization rate  
	•	Conversion rate  
	•	Booking source  
	•	Driver performance  
	•	Average order value

Reports  
	•	Daily / weekly / monthly  
	•	Export (CSV, PDF)

12\. Security & Compliance  
	•	SSL everywhere  
	•	Encrypted sensitive data  
	•	PCI compliance (via payment provider)  
	•	GDPR & CCPA readiness  
	•	Activity logs  
	•	Access restrictions (IP, roles)

13\. Future Expansion (Planned)  
	•	White-label mobile apps  
	•	Partner APIs (hotels, agencies)  
	•	AI pricing logic  
	•	Client preference memory  
	•	Chauffeur rating system

Rihla Limo – Developer Checklist

Architecture & Setup  
	•	☐ API-first backend  
	•	☐ Cloud hosting with backups  
	•	☐ Role-based access control  
	•	☐ Scalable database schema

Website & UX  
	•	☐ Responsive design  
	•	☐ SEO-optimized pages  
	•	☐ Dynamic fleet management  
	•	☐ Fast page load

Booking System  
	•	☐ Instant quote engine  
	•	☐ Multi-booking types  
	•	☐ Pricing rules engine  
	•	☐ Promo code support

Dispatch  
	•	☐ Live map tracking  
	•	☐ Driver assignment  
	•	☐ Status flow enforcement  
	•	☐ Flight tracking integration

Driver System  
	•	☐ Secure driver portal  
	•	☐ Job management  
	•	☐ Availability scheduling  
	•	☐ Document uploads

Client Portal  
	•	☐ Booking history  
	•	☐ Live tracking  
	•	☐ Corporate billing logic  
	•	☐ Invoice management

Payments  
	•	☐ Stripe integration  
	•	☐ Deposit logic  
	•	☐ Cancellation rules  
	•	☐ Refund handling

CRM & Automation  
	•	☐ Client profiles  
	•	☐ Automated notifications  
	•	☐ Review requests  
	•	☐ Loyalty logic

Analytics & Reporting  
	•	☐ KPI dashboard  
	•	☐ Exportable reports  
	•	☐ Revenue tracking

Security  
	•	☐ SSL & encryption  
	•	☐ Audit logs  
	•	☐ Compliance readiness

“Rihla Limo is building a full operational limo platform, not a simple website. The website is only the front layer of a booking, dispatch, CRM, and financial system designed for scale, premium clients, and enterprise growth.”
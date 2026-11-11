-- =====================================================================
-- DUMMY DATA ONLY. This repo is PUBLIC.
-- Every name, phone number and address below is fictional.
-- Never put real customers, phone numbers, addresses, prices, salaries
-- or employee details in this file.
--
-- Idempotent: fixed ids + ON CONFLICT DO NOTHING, so re-running is safe.
-- Times are relative to now() so the dashboard always has live examples.
-- =====================================================================

insert into public.leads
  (id, division, customer_name, phone, email, address, city, pincode, source, stage,
   load_requirement_kw, monthly_eb_bill, roof_type, next_follow_up_at, site_visit_at, lost_reason, notes)
values
  -- Rooftop
  ('00000000-0000-4000-8000-000000000001', 'rooftop', 'Ravi Kumar (demo)', '90000 00001', 'ravi.demo@example.com', '12, 3rd Cross Street, Anna Nagar', 'Chennai', '600040', 'website', 'new', 5, 4200, 'rcc', now() + interval '3 hours', null, null, 'Enquired via website form. Wants on-grid with net metering.'),
  ('00000000-0000-4000-8000-000000000002', 'rooftop', 'Lakshmi Textiles (demo)', '90000 00002', 'accounts@lakshmi-demo.example.com', 'Plot 45, SIDCO Industrial Estate', 'Coimbatore', '641021', 'indiamart', 'contacted', 50, 68000, 'metal_sheet', now() - interval '1 day', null, null, 'Factory roof ~6000 sq ft. Asked for a commercial quote.'),
  ('00000000-0000-4000-8000-000000000003', 'rooftop', 'Priya Raman (demo)', '90000 00003', null, '7, Lake View Road, Velachery', 'Chennai', '600042', 'referral', 'site_visit', 3, 2600, 'rcc', now() + interval '1 day', now() + interval '2 days', null, 'Referred by an existing customer.'),
  ('00000000-0000-4000-8000-000000000004', 'rooftop', 'Sri Murugan Hospital (demo)', '90000 00004', 'admin@smh-demo.example.com', '88, GST Road, Tambaram', 'Chennai', '600045', 'google', 'proposal_sent', 40, 52000, 'rcc', now() + interval '5 hours', null, null, 'Proposal v1 shared. Decision by the trust board.'),
  ('00000000-0000-4000-8000-000000000005', 'rooftop', 'Karthik Subramanian (demo)', '90000 00005', null, '23, Gandhi Street, T. Nagar', 'Chennai', '600017', 'whatsapp', 'negotiation', 8, 6100, 'rcc', now() + interval '2 hours', null, null, 'Asking for a better price on panels. Comparing two brands.'),
  ('00000000-0000-4000-8000-000000000006', 'rooftop', 'Green Valley School (demo)', '90000 00006', 'office@gvs-demo.example.com', 'NH 48, Sriperumbudur', 'Kanchipuram', '602105', 'referral', 'won', 25, 31000, 'rcc', null, null, null, 'PO received. Hand over to projects.'),
  ('00000000-0000-4000-8000-000000000007', 'rooftop', 'Anitha Venkatesh (demo)', '90000 00007', null, '5, Temple Street, Mylapore', 'Chennai', '600004', 'facebook', 'lost', 3, 1800, 'tile', null, null, 'Went with a cheaper local installer.', null),
  ('00000000-0000-4000-8000-000000000008', 'rooftop', 'Balaji Engineering Works (demo)', '90000 00008', null, 'B-12, Ambattur Industrial Estate', 'Chennai', '600058', 'manual', 'new', 30, 39000, 'metal_sheet', now() - interval '3 hours', null, null, 'Walk-in at office.'),
  ('00000000-0000-4000-8000-000000000009', 'rooftop', 'Deepa Narayanan (demo)', '90000 00009', 'deepa.demo@example.com', '18, Besant Avenue, Adyar', 'Chennai', '600020', 'website', 'contacted', 4, 3300, 'rcc', now() + interval '2 days', null, null, null),
  ('00000000-0000-4000-8000-000000000010', 'rooftop', 'Hotel Sea Breeze (demo)', '90000 00010', null, 'ECR, Mahabalipuram', 'Chengalpattu', '603104', 'google', 'site_visit', 60, 85000, 'rcc', now() + interval '6 hours', now() + interval '1 day', null, 'Large terrace plus a car-park canopy option.'),
  ('00000000-0000-4000-8000-000000000011', 'rooftop', 'Suresh Babu (demo)', '90000 00011', null, '41, Nehru Nagar', 'Madurai', '625014', 'whatsapp', 'new', 5, 3900, null, null, null, null, 'Sent EB bill photo on WhatsApp.'),
  ('00000000-0000-4000-8000-000000000012', 'rooftop', 'Meena Apartments Association (demo)', '90000 00012', null, '9, Second Avenue, Besant Nagar', 'Chennai', '600090', 'referral', 'proposal_sent', 20, 24000, 'rcc', now() - interval '2 days', null, null, 'Common-area load. Needs association approval.'),
  ('00000000-0000-4000-8000-000000000013', 'rooftop', 'Vignesh Traders (demo)', '90000 00013', null, '67, Main Bazaar', 'Tiruchirappalli', '620008', 'indiamart', 'won', 15, 17500, 'metal_sheet', null, null, null, null),
  ('00000000-0000-4000-8000-000000000014', 'rooftop', 'Revathi Krishnan (demo)', '90000 00014', null, '3, Park Road, Kodambakkam', 'Chennai', '600024', 'facebook', 'contacted', 3, 2400, 'asbestos', now() + interval '1 hour', null, null, 'Asbestos roof: check if a structure change is needed.'),
  -- Ground mount
  ('00000000-0000-4000-8000-000000000021', 'ground_mount', 'Sunrise Agro Farms (demo)', '90000 00021', 'ops@sunrise-demo.example.com', 'Survey No. 112, Kariapatti', 'Virudhunagar', '626106', 'referral', 'site_visit', 1000, 950000, 'open_land', now() + interval '4 hours', now() + interval '3 days', null, '5 acres available. Captive use for cold storage.'),
  ('00000000-0000-4000-8000-000000000022', 'ground_mount', 'Kaveri Spinning Mills (demo)', '90000 00022', null, 'SIPCOT, Perundurai', 'Erode', '638052', 'google', 'proposal_sent', 2000, 1850000, 'open_land', now() + interval '1 day', null, null, 'Open-access 2 MWp. Needs TANGEDCO feasibility.'),
  ('00000000-0000-4000-8000-000000000023', 'ground_mount', 'Thanjavur Cooperative Society (demo)', '90000 00023', null, 'Orathanadu Road', 'Thanjavur', '613001', 'manual', 'new', 500, null, 'open_land', now() - interval '1 day', null, null, null),
  ('00000000-0000-4000-8000-000000000024', 'ground_mount', 'Aruna Cement Works (demo)', '90000 00024', null, 'Ariyalur Industrial Area', 'Ariyalur', '621704', 'indiamart', 'negotiation', 3000, 2600000, 'open_land', now() + interval '8 hours', null, null, 'Shortlisted with one competitor.'),
  ('00000000-0000-4000-8000-000000000025', 'ground_mount', 'Pollachi Coconut Processors (demo)', '90000 00025', null, 'Kinathukadavu', 'Coimbatore', '642109', 'website', 'won', 750, 640000, 'open_land', null, null, null, 'Advance received.'),
  ('00000000-0000-4000-8000-000000000026', 'ground_mount', 'Marina Logistics Park (demo)', '90000 00026', null, 'Oragadam', 'Kanchipuram', '602105', 'facebook', 'lost', 1500, 1200000, 'open_land', null, null, 'Project postponed to next financial year.', null)
on conflict (id) do nothing;

export const apartments = [
  { 
    id: 1, 
    name: "Budapest Apartment #A12", 
    owner: "John Doe", 
    address: "Andrássy út 25, Budapest", 
    status: "Ordering", 
    designer: "Barbara Kovacs", 
    start_date: "2025-10-15", 
    due_date: "2025-12-01", 
    progress: 70 
  },
  { 
    id: 2, 
    name: "Vienna Premium Suite #B8", 
    owner: "Sarah Schmidt", 
    address: "Kärntner Straße 12, Vienna", 
    status: "Delivery", 
    designer: "Maria Weber", 
    start_date: "2025-09-20", 
    due_date: "2025-11-15", 
    progress: 85 
  },
  { 
    id: 3, 
    name: "Prague Center Loft #C3", 
    owner: "Pavel Novak", 
    address: "Wenceslas Square 45, Prague", 
    status: "Planning", 
    designer: "Barbara Kovacs", 
    start_date: "2025-11-01", 
    due_date: "2025-12-20", 
    progress: 30 
  },
  { 
    id: 4, 
    name: "Berlin Modern Flat #D15", 
    owner: "Klaus Mueller", 
    address: "Alexanderplatz 8, Berlin", 
    status: "Complete", 
    designer: "Maria Weber", 
    start_date: "2025-08-01", 
    due_date: "2025-10-15", 
    progress: 100 
  }
];

export const products = [
  { 
    id: 1, 
    apartment_id: 1, 
    apartment: "Budapest Apartment #A12",
    product: "Marble Cookware Set", 
    vendor: "Royalty Line", 
    price: 129.99, 
    qty: 3, 
    status: "Ordered", 
    availability: "In Stock", 
    eta: "2025-11-12",
    image: "🍳",
    notes: "",
    deliveryType: "DPD Hungary",
    deliveryAddress: "Andrássy út 25, 3rd Floor",
    deliveryCity: "Budapest",
    deliveryPostalCode: "1061",
    deliveryCountry: "Hungary",
    deliveryInstructions: "Ring apartment 12. Delivery person should use the main entrance. Elevator available.",
    deliveryContactPerson: "John Doe",
    deliveryContactPhone: "+36 20 123 4567",
    deliveryContactEmail: "john.doe@example.com",
    trackingNumber: "DPD-HU-2025-8834",
    deliveryTimeWindow: "09:00 - 12:00"
  },
  { 
    id: 2, 
    apartment_id: 1, 
    apartment: "Budapest Apartment #A12",
    product: "Wood Dining Table", 
    vendor: "IKEA", 
    price: 499.00, 
    qty: 1, 
    status: "Waiting Stock", 
    availability: "Backorder", 
    eta: "2025-11-25",
    image: "🪑",
    notes: "Expected restock mid-November",
    deliveryType: "GLS Hungary",
    deliveryAddress: "Andrássy út 25, 3rd Floor",
    deliveryCity: "Budapest",
    deliveryPostalCode: "1061",
    deliveryCountry: "Hungary",
    deliveryInstructions: "Heavy item - two persons required. Please call 30 minutes before arrival.",
    deliveryContactPerson: "John Doe",
    deliveryContactPhone: "+36 20 123 4567",
    deliveryContactEmail: "john.doe@example.com",
    trackingNumber: "GLS-HU-2025-9912",
    deliveryTimeWindow: "14:00 - 18:00"
  },
  { 
    id: 3, 
    apartment_id: 2, 
    apartment: "Vienna Premium Suite #B8",
    product: "Modern Sofa", 
    vendor: "IKEA", 
    price: 899.00, 
    qty: 1, 
    status: "Delivered", 
    availability: "In Stock", 
    eta: "2025-11-01",
    image: "🛋️",
    notes: "Delivered successfully",
    deliveryType: "Sameday Courier Hungary",
    deliveryAddress: "Kärntner Straße 12, Apartment 5B",
    deliveryCity: "Vienna",
    deliveryPostalCode: "1010",
    deliveryCountry: "Austria",
    deliveryInstructions: "Building has concierge service. Leave with concierge if no one is home.",
    deliveryContactPerson: "Sarah Schmidt",
    deliveryContactPhone: "+43 664 987 6543",
    deliveryContactEmail: "sarah.schmidt@example.com",
    trackingNumber: "SMD-AT-2025-7723",
    deliveryTimeWindow: "10:00 - 16:00",
    deliveryNotes: "Successfully delivered and received by Sarah Schmidt on November 1st"
  },
  { 
    id: 4, 
    apartment_id: 2, 
    apartment: "Vienna Premium Suite #B8",
    product: "LED Floor Lamp", 
    vendor: "Philips", 
    price: 79.99, 
    qty: 2, 
    status: "Issue", 
    availability: "In Stock", 
    eta: "2025-11-05",
    image: "💡",
    notes: "One lamp arrived damaged",
    deliveryType: "DPD Hungary",
    deliveryAddress: "Kärntner Straße 12, Apartment 5B",
    deliveryCity: "Vienna",
    deliveryPostalCode: "1010",
    deliveryCountry: "Austria",
    deliveryInstructions: "Fragile items. Handle with care. Ring doorbell twice.",
    deliveryContactPerson: "Sarah Schmidt",
    deliveryContactPhone: "+43 664 987 6543",
    deliveryContactEmail: "sarah.schmidt@example.com",
    trackingNumber: "DPD-AT-2025-6654",
    deliveryTimeWindow: "09:00 - 13:00",
    deliveryNotes: "One item arrived damaged - replacement requested"
  },
  { 
    id: 5, 
    apartment_id: 3, 
    apartment: "Prague Center Loft #C3",
    product: "King Size Bed Frame", 
    vendor: "IKEA", 
    price: 599.00, 
    qty: 1, 
    status: "New", 
    availability: "In Stock", 
    eta: "",
    image: "🛏️",
    notes: "",
    deliveryType: "GLS Hungary",
    deliveryAddress: "Wenceslas Square 45, Building A",
    deliveryCity: "Prague",
    deliveryPostalCode: "110 00",
    deliveryCountry: "Czech Republic",
    deliveryInstructions: "Use service entrance on the side of the building. No elevator - stairs only to 2nd floor.",
    deliveryContactPerson: "Pavel Novak",
    deliveryContactPhone: "+420 777 123 456",
    deliveryContactEmail: "pavel.novak@example.com",
    trackingNumber: "",
    deliveryTimeWindow: "08:00 - 12:00"
  }
];

export const vendors = [
  { 
    id: 1, 
    name: "IKEA Hungary", 
    logo: "🏠",
    website: "https://ikea.hu", 
    contact: "vendor@ikea.hu", 
    lead_time: "7 days", 
    reliability: 4.6,
    orders_count: 28,
    active_issues: 2
  },
  { 
    id: 2, 
    name: "Royalty Line Europe", 
    logo: "👑",
    website: "https://royaltyline.eu", 
    contact: "sales@royaltyline.eu", 
    lead_time: "5 days", 
    reliability: 4.8,
    orders_count: 15,
    active_issues: 0
  },
  { 
    id: 3, 
    name: "Philips Lighting", 
    logo: "💡",
    website: "https://philips.com", 
    contact: "b2b@philips.com", 
    lead_time: "10 days", 
    reliability: 4.5,
    orders_count: 12,
    active_issues: 1
  },
  { 
    id: 4, 
    name: "Home Depot EU", 
    logo: "🔨",
    website: "https://homedepot.eu", 
    contact: "sales@homedepot.eu", 
    lead_time: "6 days", 
    reliability: 4.7,
    orders_count: 22,
    active_issues: 0
  }
];

export const orders = [
  {
    id: 1,
    po_number: "PO-2025-001",
    apartment_id: 1,
    apartment: "Budapest Apartment #A12",
    vendor: "IKEA Hungary",
    items_count: 8,
    total: 2499.99,
    confirmation: "CONF-8834",
    tracking: "TRK-99234",
    status: "Confirmed",
    placed_on: "2025-10-20"
  },
  {
    id: 2,
    po_number: "PO-2025-002",
    apartment_id: 2,
    apartment: "Vienna Premium Suite #B8",
    vendor: "Royalty Line Europe",
    items_count: 5,
    total: 649.95,
    confirmation: "",
    tracking: "",
    status: "Sent",
    placed_on: "2025-10-25"
  },
  {
    id: 3,
    po_number: "PO-2025-003",
    apartment_id: 1,
    apartment: "Budapest Apartment #A12",
    vendor: "Philips Lighting",
    items_count: 12,
    total: 1299.88,
    confirmation: "CONF-7723",
    tracking: "TRK-88445",
    status: "Received",
    placed_on: "2025-10-15"
  }
];

export const deliveries = [
  {
    id: 1,
    apartment: "Budapest Apartment #A12",
    vendor: "IKEA Hungary",
    order_no: "PO-2025-001",
    eta: "2025-11-15",
    actual_delivery: "",
    received_by: "",
    status: "Scheduled",
    priority: "High",
    time_slot: "09:00 - 12:00",
    contact_person: "John Doe",
    contact_phone: "+36 20 123 4567",
    delivery_address: "Andrássy út 25, Budapest",
    tracking_number: "TRK-99234",
    delivery_fee: 25.00,
    items_count: 8,
    total_weight: "125 kg",
    carrier: "DHL Express",
    notes: "Morning delivery 9-12am",
    special_instructions: "Call before arrival"
  },
  {
    id: 2,
    apartment: "Vienna Premium Suite #B8",
    vendor: "Philips Lighting",
    order_no: "PO-2025-003",
    eta: "2025-11-08",
    actual_delivery: "2025-11-07",
    received_by: "Maria Weber",
    status: "Delivered",
    priority: "Medium",
    time_slot: "14:00 - 17:00",
    contact_person: "Sarah Schmidt",
    contact_phone: "+43 664 987 6543",
    delivery_address: "Kärntner Straße 12, Vienna",
    tracking_number: "TRK-88445",
    delivery_fee: 30.00,
    items_count: 12,
    total_weight: "85 kg",
    carrier: "UPS Standard",
    notes: "All items received in good condition",
    special_instructions: "Elevator available"
  },
  {
    id: 3,
    apartment: "Prague Center Loft #C3",
    vendor: "Home Depot EU",
    order_no: "PO-2025-004",
    eta: "2025-11-20",
    actual_delivery: "",
    received_by: "",
    status: "In Transit",
    priority: "Low",
    time_slot: "10:00 - 14:00",
    contact_person: "Pavel Novak",
    contact_phone: "+420 777 123 456",
    delivery_address: "Wenceslas Square 45, Prague",
    tracking_number: "TRK-77223",
    delivery_fee: 20.00,
    items_count: 5,
    total_weight: "45 kg",
    carrier: "FedEx Ground",
    notes: "Package currently in transit",
    special_instructions: "Ring doorbell twice"
  },
  {
    id: 4,
    apartment: "Berlin Modern Flat #D15",
    vendor: "Royalty Line Europe",
    order_no: "PO-2025-005",
    eta: "2025-11-18",
    actual_delivery: "",
    received_by: "",
    status: "Scheduled",
    priority: "Medium",
    time_slot: "13:00 - 16:00",
    contact_person: "Klaus Mueller",
    contact_phone: "+49 176 234 5678",
    delivery_address: "Alexanderplatz 8, Berlin",
    tracking_number: "TRK-66112",
    delivery_fee: 28.00,
    items_count: 15,
    total_weight: "95 kg",
    carrier: "DPD Express",
    notes: "Fragile items included",
    special_instructions: "Handle with care"
  },
  {
    id: 5,
    apartment: "Budapest Apartment #A12",
    vendor: "Home Depot EU",
    order_no: "PO-2025-006",
    eta: "2025-11-22",
    actual_delivery: "",
    received_by: "",
    status: "Delayed",
    priority: "High",
    time_slot: "08:00 - 11:00",
    contact_person: "John Doe",
    contact_phone: "+36 20 123 4567",
    delivery_address: "Andrássy út 25, Budapest",
    tracking_number: "TRK-55001",
    delivery_fee: 35.00,
    items_count: 3,
    total_weight: "180 kg",
    carrier: "DHL Express",
    notes: "Delayed due to weather conditions",
    special_instructions: "Two persons required for unloading"
  }
];

export const issues = [
  {
    id: 1,
    item: "LED Floor Lamp",
    image: "💡",
    vendor: "Philips Lighting",
    apartment: "Vienna Premium Suite #B8",
    issue_type: "Broken",
    description: "Glass shade arrived cracked",
    priority: "High",
    status: "Reported",
    created_date: "2025-11-01",
    assigned_user: "Admin"
  },
  {
    id: 2,
    item: "Dining Chair Set",
    image: "🪑",
    vendor: "IKEA Hungary",
    apartment: "Budapest Apartment #A12",
    issue_type: "Missing",
    description: "Only 5 chairs delivered instead of 6",
    priority: "Medium",
    status: "Emailed Vendor",
    created_date: "2025-10-28",
    assigned_user: "Admin"
  },
  {
    id: 3,
    item: "Area Rug",
    image: "🧶",
    vendor: "Home Depot EU",
    apartment: "Vienna Premium Suite #B8",
    issue_type: "Wrong",
    description: "Wrong color - ordered beige, received gray",
    priority: "Low",
    status: "Awaiting Reply",
    created_date: "2025-10-25",
    assigned_user: "Maria Weber"
  }
];

export const payments = [
  {
    id: 1,
    apartment: "Budapest Apartment #A12",
    vendor: "IKEA Hungary",
    order_no: "PO-2025-001",
    amount: 2499.99,
    status: "Paid",
    due_date: "2025-11-01",
    paid_date: "2025-10-28",
    invoice_file: "INV-001.pdf"
  },
  {
    id: 2,
    apartment: "Vienna Premium Suite #B8",
    vendor: "Royalty Line Europe",
    order_no: "PO-2025-002",
    amount: 649.95,
    status: "Due",
    due_date: "2025-11-10",
    paid_date: "",
    invoice_file: "INV-002.pdf"
  },
  {
    id: 3,
    apartment: "Budapest Apartment #A12",
    vendor: "Philips Lighting",
    order_no: "PO-2025-003",
    amount: 1299.88,
    status: "Overdue",
    due_date: "2025-10-30",
    paid_date: "",
    invoice_file: "INV-003.pdf"
  }
];

export const users = [
  {
    id: 1,
    name: "Barbara Kovacs",
    role: "Designer",
    email: "barbara@buy2rent.com",
    phone: "+36 20 123 4567",
    assigned_apartments: 2,
    status: "Active",
    last_active: "2025-11-05 14:30"
  },
  {
    id: 2,
    name: "Maria Weber",
    role: "Designer",
    email: "maria@buy2rent.com",
    phone: "+43 664 987 6543",
    assigned_apartments: 2,
    status: "Active",
    last_active: "2025-11-05 09:15"
  },
  {
    id: 3,
    name: "Admin User",
    role: "System Admin",
    email: "admin@buy2rent.com",
    phone: "+36 30 555 1234",
    assigned_apartments: 0,
    status: "Active",
    last_active: "2025-11-05 15:45"
  }
];

export const automations = [
  {
    id: 1,
    name: "Supplier Issue Email",
    enabled: true,
    template: {
      subject: "Issue Report - {{product}} - Order {{order_no}}",
      body: "Dear {{vendor}},\n\nWe have identified an issue with the following product:\n\nProduct: {{product}}\nApartment: {{apartment}}\nIssue Type: {{issue_type}}\nDescription: {{description}}\n\nPlease advise on next steps for resolution.\n\nBest regards,\nBuy2Rent Team"
    }
  },
  {
    id: 2,
    name: "Payment Reminder",
    enabled: true,
    template: {
      subject: "Payment Reminder - Invoice {{invoice_no}}",
      body: "Dear {{vendor}},\n\nThis is a reminder that payment for invoice {{invoice_no}} is due on {{due_date}}.\n\nAmount: €{{amount}}\nOrder: {{order_no}}\n\nThank you,\nBuy2Rent Finance Team"
    }
  },
  {
    id: 3,
    name: "Out-of-Stock Replacement",
    enabled: false,
    template: {
      subject: "Product Replacement Request - {{product}}",
      body: "Dear {{vendor}},\n\nThe product {{product}} is currently out of stock. Could you please suggest a suitable replacement?\n\nOriginal Product: {{product}}\nApartment: {{apartment}}\nBudget: €{{price}}\n\nThank you,\nBuy2Rent Procurement"
    }
  }
];

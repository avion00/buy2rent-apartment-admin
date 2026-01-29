import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountStatus: 'Active' | 'Inactive';
  type: 'Investor' | 'Buy2Rent Internal';
  notes?: string;
}

export interface Apartment {
  id: string;
  name: string;
  type: 'furnishing' | 'renovating';
  clientId: string;
  owner: string; // Kept for backward compatibility, will be derived from client
  address: string;
  status: string;
  designer: string;
  startDate: string;
  dueDate: string;
  progress: number;
  notes?: string;
}

export interface Vendor {
  id: string;
  name: string;
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
}

export interface Product {
  id: string;
  apartmentId: string;
  product: string;
  vendor: string;
  vendorId?: string;
  vendorLink: string;
  sku: string;
  unitPrice: number;
  qty: number;
  availability: 'In Stock' | 'Backorder' | 'Out of Stock';
  statusTags: string[];
  status: 'Design Approved' | 'Ready To Order' | 'Ordered' | 'Waiting For Stock' | 'Shipped' | 'Delivered' | 'Damaged' | 'Wrong Item' | 'Missing' | 'Replacement Requested' | 'Replacement Approved' | 'Payment Pending' | 'Payment Partial' | 'Payment Complete' | 'Closed';
  eta?: string;
  category?: string;
  room?: string;
  imageUrl?: string;
  replacementOf?: string;
  notes?: string;
  orderedOn?: string;
  actualDeliveryDate?: string;
  deliveryStatusTags: string[];
  expectedDeliveryDate?: string;
  paymentStatus?: 'Unpaid' | 'Partially Paid' | 'Paid';
  paymentDueDate?: string;
  paymentAmount?: number;
  paidAmount?: number;
  issueState?: 'No Issue' | 'Issue Reported' | 'AI Resolving' | 'Human Action Required' | 'Pending Vendor Response' | 'Resolved';
  issueId?: string;
  // Extended fields
  brand?: string;
  countryOfOrigin?: string;
  currency?: string;
  shippingCost?: number;
  discount?: number;
  totalAmount?: number;
  totalPaid?: number;
  outstandingBalance?: number;
  trackingNumber?: string;
  conditionOnArrival?: string;
  // Delivery Location Fields
  deliveryType?: 'DPD Hungary' | 'GLS Hungary' | 'Sameday Courier Hungary' | string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryPostalCode?: string;
  deliveryCountry?: string;
  deliveryInstructions?: string;
  deliveryContactPerson?: string;
  deliveryContactPhone?: string;
  deliveryContactEmail?: string;
  deliveryTimeWindow?: string;
  deliveryNotes?: string;
  issueType?: string;
  issueDescription?: string;
  replacementRequested?: boolean;
  replacementApproved?: boolean;
  replacementETA?: string;
  manualNotes?: string;
  aiSummaryNotes?: string;
  attachments?: string[];
  createdBy?: string;
  createdAt?: string;
}

export interface Delivery {
  id: string;
  apartmentId: string;
  vendor: string;
  orderReference: string;
  expectedDate: string;
  actualDate?: string;
  receivedBy?: string;
  status: 'Scheduled' | 'In Transit' | 'Delivered' | 'Issue Reported';
  notes?: string;
  proofPhotos?: string[];
}

export interface Payment {
  id: string;
  apartmentId: string;
  vendor: string;
  orderReference: string;
  totalAmount: number;
  amountPaid: number;
  dueDate: string;
  status: 'Unpaid' | 'Partial' | 'Paid' | 'Overdue';
  lastPaymentDate?: string;
  notes?: string;
  paymentHistory: Array<{
    date: string;
    amount: number;
    method: string;
    referenceNo?: string;
    note?: string;
  }>;
}

export interface Issue {
  id: string;
  apartmentId: string;
  productId: string;
  productName: string;
  vendor: string;
  type: string;
  description: string;
  reportedOn: string;
  status: 'Open' | 'Pending Vendor Response' | 'Resolution Agreed' | 'Closed';
  priority?: string;
  expectedResolution?: string;
  vendorContact?: string;
  impact?: string;
  replacementEta?: string;
  photos?: Array<{
    id: string;
    url: string;
    uploadedAt: string;
  }>;
  aiActivated?: boolean;
  aiCommunicationLog?: Array<{
    timestamp: string;
    sender: 'AI' | 'Vendor' | 'System';
    message: string;
  }>;
  resolutionStatus?: 'Open' | 'Pending Vendor Response' | 'Resolution Agreed' | 'Closed';
}

export interface Activity {
  id: string;
  apartmentId: string;
  timestamp: string;
  actor: string;
  icon: string;
  summary: string;
  type: 'product' | 'payment' | 'delivery' | 'issue' | 'ai' | 'status';
}

export interface AINote {
  id: string;
  apartmentId: string;
  timestamp: string;
  sender: 'AI' | 'Admin' | 'Vendor';
  content: string;
  emailSubject?: string;
  relatedTo?: string;
}

interface DataStore {
  clients: Client[];
  apartments: Apartment[];
  vendors: Vendor[];
  products: Product[];
  deliveries: Delivery[];
  payments: Payment[];
  issues: Issue[];
  activities: Activity[];
  aiNotes: AINote[];
  manualNotes: Record<string, string>;
  
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClient: (id: string) => Client | undefined;
  
  addVendor: (vendor: Omit<Vendor, 'id'>) => void;
  updateVendor: (id: string, vendor: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;
  getVendor: (id: string) => Vendor | undefined;
  getVendorByName: (name: string) => Vendor | undefined;
  
  addApartment: (apartment: Omit<Apartment, 'id'>) => void;
  updateApartment: (id: string, apartment: Partial<Apartment>) => void;
  deleteApartment: (id: string) => void;
  getApartment: (id: string) => Apartment | undefined;
  getApartmentsByType: (type: 'furnishing' | 'renovating') => Apartment[];
  getApartmentsByClient: (clientId: string) => Apartment[];
  
  addProduct: (product: Omit<Product, 'id'>) => void;
  addProducts: (products: Omit<Product, 'id'>[]) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  getProductsByApartment: (apartmentId: string) => Product[];
  
  addDelivery: (delivery: Omit<Delivery, 'id'>) => void;
  updateDelivery: (id: string, delivery: Partial<Delivery>) => void;
  getDeliveriesByApartment: (apartmentId: string) => Delivery[];
  
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  addPaymentToHistory: (id: string, paymentEntry: Payment['paymentHistory'][0]) => void;
  getPaymentsByApartment: (apartmentId: string) => Payment[];
  
  addIssue: (issue: Omit<Issue, 'id'>) => void;
  updateIssue: (id: string, issue: Partial<Issue>) => void;
  getIssuesByApartment: (apartmentId: string) => Issue[];
  
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  getActivitiesByApartment: (apartmentId: string) => Activity[];
  
  addAINote: (note: Omit<AINote, 'id' | 'timestamp'>) => void;
  getAINotesByApartment: (apartmentId: string) => AINote[];
  
  setManualNote: (apartmentId: string, note: string) => void;
  getManualNote: (apartmentId: string) => string;
}

const seedData = () => {
  return {
    vendors: [
      {
        id: 'vendor-001',
        name: 'IKEA',
        companyName: 'IKEA Hungary Kft.',
        contactPerson: 'Sales Department',
        email: 'sales@ikea.hu',
        phone: '+36 1 123 4567',
        website: 'https://www.ikea.com/hu/hu/',
        notes: 'Main furniture supplier',
      },
      {
        id: 'vendor-002',
        name: 'Royalty Line',
        companyName: 'Royalty Line Europe',
        contactPerson: 'Customer Service',
        email: 'support@royaltyline.eu',
        phone: '+36 30 234 5678',
        website: 'https://royaltyline.eu/',
        notes: 'Kitchen and cookware specialist',
      },
      {
        id: 'vendor-003',
        name: 'JYSK',
        companyName: 'JYSK Hungary',
        contactPerson: 'B2B Sales',
        email: 'b2b@jysk.hu',
        phone: '+36 1 345 6789',
        website: 'https://jysk.hu/',
        notes: 'Bedroom furniture and textiles',
      },
    ],
    clients: [
      {
        id: 'client-001',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+36 20 123 4567',
        accountStatus: 'Active' as const,
        type: 'Investor' as const,
        notes: 'Long-term investor with multiple properties',
      },
      {
        id: 'client-002',
        name: 'Anna Nagy',
        email: 'anna.nagy@example.com',
        phone: '+36 30 987 6543',
        accountStatus: 'Active' as const,
        type: 'Investor' as const,
        notes: '',
      },
      {
        id: 'client-003',
        name: 'Miklós Szabó',
        email: 'miklos.szabo@example.com',
        phone: '+36 70 555 1234',
        accountStatus: 'Active' as const,
        type: 'Investor' as const,
        notes: '',
      },
      {
        id: 'client-internal',
        name: 'Buy2Rent Internal',
        email: 'info@buy2rent.com',
        phone: '+36 1 234 5678',
        accountStatus: 'Active' as const,
        type: 'Buy2Rent Internal' as const,
        notes: 'Internal company projects',
      },
    ],
    apartments: [
      {
        id: 'apt-001',
        name: 'Izabella utca 3 • A/12',
        type: 'furnishing' as const,
        clientId: 'client-001',
        owner: 'John Doe',
        address: 'Izabella u. 3, Budapest',
        status: 'Ordering',
        designer: 'Barbara Kovács',
        startDate: '2025-10-15',
        dueDate: '2025-12-05',
        progress: 68,
        notes: '',
      },
      {
        id: 'apt-002',
        name: 'Váci út 41 • 3.em 7',
        type: 'renovating' as const,
        clientId: 'client-002',
        owner: 'Anna Nagy',
        address: 'Váci út 41, Budapest',
        status: 'Renovating',
        designer: 'Barbara Kovács',
        startDate: '2025-09-10',
        dueDate: '2025-11-28',
        progress: 52,
        notes: '',
      },
      {
        id: 'apt-003',
        name: 'Andrássy út 25 • B/5',
        type: 'furnishing' as const,
        clientId: 'client-003',
        owner: 'Miklós Szabó',
        address: 'Andrássy út 25, Budapest',
        status: 'Design Approved',
        designer: 'Barbara Kovács',
        startDate: '2025-10-01',
        dueDate: '2025-12-01',
        progress: 74,
        notes: '',
      },
    ],
    products: [
      {
        id: 'p-1001',
        apartmentId: 'apt-001',
        product: 'Kanapė – 3 személyes',
        vendor: 'IKEA',
        vendorLink: 'https://www.ikea.com/hu/hu/',
        sku: 'IK-SOFA-3',
        unitPrice: 159999,
        qty: 1,
        availability: 'In Stock' as const,
        status: 'Ordered' as const,
        statusTags: ['Ordered'],
        deliveryStatusTags: ['Scheduled'],
        eta: '2025-11-14',
        category: 'Living Room',
        room: 'Nappali',
        imageUrl: '',
        orderedOn: '2025-11-01',
        expectedDeliveryDate: '2025-11-14',
        paymentStatus: 'Partially Paid' as const,
        paymentDueDate: '2025-11-12',
        paymentAmount: 159999,
        paidAmount: 63999,
        issueState: 'AI Resolving' as const,
        issueId: 'issue-002',
        vendorId: 'vendor-001',
      },
      {
        id: 'p-1002',
        apartmentId: 'apt-001',
        product: 'Étkezőasztal – Tölgy',
        vendor: 'IKEA',
        vendorLink: 'https://www.ikea.com/hu/hu/',
        sku: 'IK-DINE-OAK',
        unitPrice: 89999,
        qty: 1,
        availability: 'Backorder' as const,
        status: 'Waiting For Stock' as const,
        statusTags: ['Ordered', 'Waiting For Stock'],
        deliveryStatusTags: ['Scheduled'],
        eta: '2025-11-25',
        category: 'Dining',
        room: 'Étkező',
        imageUrl: '',
        orderedOn: '2025-11-02',
        expectedDeliveryDate: '2025-11-25',
        paymentStatus: 'Partially Paid' as const,
        paymentDueDate: '2025-11-12',
        paymentAmount: 89999,
        paidAmount: 36001,
        issueState: 'No Issue' as const,
        vendorId: 'vendor-001',
      },
      {
        id: 'p-1003',
        apartmentId: 'apt-001',
        product: 'Marble Cookware Set',
        vendor: 'Royalty Line',
        vendorLink: 'https://royaltyline.eu/',
        sku: 'RL-COOK-SET',
        unitPrice: 12999,
        qty: 2,
        availability: 'In Stock' as const,
        status: 'Damaged' as const,
        statusTags: ['Delivered', 'Damaged'],
        deliveryStatusTags: ['Delivered', 'Issue Reported'],
        eta: '2025-11-12',
        category: 'Kitchen',
        room: 'Konyha',
        imageUrl: '',
        orderedOn: '2025-10-28',
        actualDeliveryDate: '2025-11-04',
        expectedDeliveryDate: '2025-11-04',
        paymentStatus: 'Paid' as const,
        paymentDueDate: '2025-11-03',
        paymentAmount: 25998,
        paidAmount: 25998,
        issueState: 'AI Resolving' as const,
        issueId: 'issue-001',
        vendorId: 'vendor-002',
      },
      {
        id: 'p-1004',
        apartmentId: 'apt-003',
        product: 'King Size Ágy - Fekete',
        vendor: 'JYSK',
        vendorLink: 'https://jysk.hu/',
        sku: 'JY-BED-KING-BLK',
        unitPrice: 129000,
        qty: 1,
        availability: 'In Stock' as const,
        status: 'Delivered' as const,
        statusTags: ['Delivered'],
        deliveryStatusTags: ['Delivered'],
        category: 'Bedroom',
        room: 'Hálószoba',
        imageUrl: '',
        orderedOn: '2025-10-20',
        actualDeliveryDate: '2025-11-03',
        expectedDeliveryDate: '2025-11-03',
        paymentStatus: 'Paid' as const,
        paymentDueDate: '2025-10-25',
        paymentAmount: 129000,
        paidAmount: 129000,
        issueState: 'No Issue' as const,
        vendorId: 'vendor-003',
      },
    ],
    deliveries: [
      {
        id: 'del-001',
        apartmentId: 'apt-001',
        vendor: 'IKEA',
        orderReference: 'IK-ORD-001',
        expectedDate: '2025-11-14',
        status: 'Scheduled' as const,
        notes: 'Delivery window: 9:00-12:00',
      },
      {
        id: 'del-002',
        apartmentId: 'apt-001',
        vendor: 'Royalty Line',
        orderReference: 'RL-ORD-002',
        expectedDate: '2025-11-04',
        actualDate: '2025-11-04',
        receivedBy: 'John Doe',
        status: 'Issue Reported' as const,
        notes: 'Items damaged during shipping',
        proofPhotos: [],
      },
    ],
    payments: [
      {
        id: 'pay-001',
        apartmentId: 'apt-001',
        vendor: 'IKEA',
        orderReference: 'IK-ORD-001',
        totalAmount: 249998,
        amountPaid: 100000,
        dueDate: '2025-11-12',
        status: 'Partial' as const,
        lastPaymentDate: '2025-11-01',
        paymentHistory: [
          {
            date: '2025-11-01',
            amount: 100000,
            method: 'Bank Transfer',
            referenceNo: 'TRF-20251101-001',
            note: 'Initial payment',
          },
        ],
      },
      {
        id: 'pay-002',
        apartmentId: 'apt-001',
        vendor: 'Royalty Line',
        orderReference: 'RL-ORD-002',
        totalAmount: 25998,
        amountPaid: 25998,
        dueDate: '2025-11-03',
        status: 'Paid' as const,
        lastPaymentDate: '2025-10-30',
        paymentHistory: [
          {
            date: '2025-10-30',
            amount: 25998,
            method: 'Credit Card',
            referenceNo: 'CC-20251030-002',
          },
        ],
      },
    ],
    issues: [
      {
        id: 'issue-001',
        apartmentId: 'apt-001',
        productId: 'p-1003',
        productName: 'Marble Cookware Set',
        vendor: 'Royalty Line',
        type: 'Broken/Damaged' as const,
        description: 'Two pans arrived with cracked marble coating. Product unusable.',
        reportedOn: '2025-11-04',
        status: 'Pending Vendor Response' as const,
        photos: [],
        aiActivated: true,
        aiCommunicationLog: [
          {
            timestamp: '2025-11-04T16:12:00',
            sender: 'AI' as const,
            message: 'Dear Royalty Line Team,\n\nWe received order RL-ORD-002 (Marble Cookware Set, SKU: RL-COOK-SET) on November 4th, 2025. Unfortunately, two pans arrived with cracked marble coating, rendering them unusable.\n\nKindly confirm the replacement or refund procedure at your earliest convenience.\n\nBest regards,\nBuy2Rent FPMS',
          },
          {
            timestamp: '2025-11-04T18:45:00',
            sender: 'Vendor' as const,
            message: 'Hello,\n\nThank you for contacting us. We apologize for the damaged items. We will arrange a replacement shipment immediately.\n\nPlease return the damaged items to our warehouse. RMA #RL-2025-1104.\n\nExpected replacement delivery: November 10th, 2025.\n\nBest regards,\nRoyalty Line Customer Service',
          },
          {
            timestamp: '2025-11-04T18:46:00',
            sender: 'System' as const,
            message: '⚠️ HUMAN ACTION REQUIRED: Vendor requires damaged item to be shipped back. Please arrange pickup or return shipping for damaged cookware set by November 8th, 2025. RMA Number: RL-2025-1104.',
          },
          {
            timestamp: '2025-11-04T19:00:00',
            sender: 'AI' as const,
            message: 'Thank you for your prompt response. We acknowledge the replacement shipment scheduled for November 10th. Return shipment will be arranged as per RMA #RL-2025-1104.\n\nBest regards,\nBuy2Rent FPMS',
          },
        ],
        resolutionStatus: 'Resolution Agreed' as const,
      },
      {
        id: 'issue-002',
        apartmentId: 'apt-001',
        productId: 'p-1001',
        productName: 'Kanapė – 3 személyes',
        vendor: 'IKEA',
        type: 'Wrong Item/Color' as const,
        description: 'Sofa delivered in wrong color - ordered grey (kivitelben szürke), received beige.',
        reportedOn: '2025-11-05',
        status: 'Pending Vendor Response' as const,
        photos: [],
        aiActivated: true,
        aiCommunicationLog: [
          {
            timestamp: '2025-11-05T09:15:00',
            sender: 'AI' as const,
            message: 'Dear IKEA Customer Service,\n\nWe have an issue with order IK-ORD-001 for the 3-seater sofa (SKU: IK-SOFA-3).\n\nOrdered: Grey color (kivitelben szürke)\nReceived: Beige color\n\nCould you please advise on the exchange process? We need the correct grey sofa as per our original order.\n\nBest regards,\nBuy2Rent Procurement Team',
          },
          {
            timestamp: '2025-11-05T11:30:00',
            sender: 'Vendor' as const,
            message: 'Hello,\n\nThank you for reporting this issue. We sincerely apologize for the color mix-up.\n\nWe have checked our inventory and the grey 3-seater sofa is currently in stock. We can arrange:\n\n1. Pickup of the beige sofa: November 8th, 2025\n2. Delivery of the correct grey sofa: November 12th, 2025\n\nNo additional charges will apply. We will send you a return label via email within 2 hours.\n\nReference Number: IKEA-EXCH-20251105-001\n\nBest regards,\nIKEA Hungary Customer Service',
          },
          {
            timestamp: '2025-11-05T11:45:00',
            sender: 'AI' as const,
            message: 'Thank you for your prompt response and the proposed solution.\n\nWe confirm:\n- Pickup of beige sofa: November 8th, 2025 ✓\n- Delivery of grey sofa: November 12th, 2025 ✓\n- Reference: IKEA-EXCH-20251105-001 ✓\n\nWe will ensure the beige sofa is ready for pickup on the 8th. Please send the return label to our registered email address.\n\nThank you for your cooperation.\n\nBest regards,\nBuy2Rent Procurement Team',
          },
          {
            timestamp: '2025-11-05T14:20:00',
            sender: 'Vendor' as const,
            message: 'Perfect! Return label has been sent to your email (info@buy2rent.com).\n\nPickup scheduled for November 8th between 10:00-14:00.\nDelivery scheduled for November 12th between 9:00-13:00.\n\nWe have also applied a 10% courtesy discount on your next purchase as an apology for the inconvenience.\n\nThank you for your understanding!\n\nIKEA Hungary',
          },
          {
            timestamp: '2025-11-05T14:25:00',
            sender: 'AI' as const,
            message: 'Excellent! We have received the return label.\n\nWe appreciate the courtesy discount and your professional handling of this matter. Looking forward to receiving the correct grey sofa on November 12th.\n\nBest regards,\nBuy2Rent Procurement Team',
          },
        ],
        resolutionStatus: 'Resolution Agreed' as const,
      },
    ],
    activities: [
      {
        id: 'act-001',
        apartmentId: 'apt-001',
        timestamp: '2025-11-04T09:15:00',
        actor: 'Admin',
        icon: 'ShoppingCart',
        summary: 'Product "Kanapė – 3 személyes" marked as Ordered',
        type: 'product' as const,
      },
      {
        id: 'act-002',
        apartmentId: 'apt-001',
        timestamp: '2025-11-04T14:30:00',
        actor: 'Admin',
        icon: 'CreditCard',
        summary: 'Partial payment of 100,000 HUF logged for IKEA order (Outstanding: 149,998 HUF)',
        type: 'payment' as const,
      },
      {
        id: 'act-003',
        apartmentId: 'apt-001',
        timestamp: '2025-11-04T16:12:00',
        actor: 'AI Assistant',
        icon: 'Mail',
        summary: 'AI emailed vendor Royalty Line about broken cookware set',
        type: 'ai' as const,
      },
      {
        id: 'act-004',
        apartmentId: 'apt-001',
        timestamp: '2025-11-04T11:45:00',
        actor: 'John Doe',
        icon: 'PackageCheck',
        summary: 'Delivery received from Royalty Line - issue reported',
        type: 'delivery' as const,
      },
    ],
    aiNotes: [
      {
        id: 'ai-001',
        apartmentId: 'apt-001',
        timestamp: '2025-11-04T16:12:00',
        sender: 'AI' as const,
        content: 'Dear Royalty Line Team,\n\nWe received order RL-ORD-002 (Marble Cookware Set, SKU: RL-COOK-SET) on November 4th, 2025. Unfortunately, two pans arrived with cracked marble coating, rendering them unusable.\n\nKindly confirm the replacement or refund procedure at your earliest convenience.\n\nBest regards,\nBuy2Rent FPMS',
        emailSubject: 'Issue Report: Damaged Items - Order RL-ORD-002',
        relatedTo: 'issue-001',
      },
    ],
    manualNotes: {},
  };
};

// Call seedData once when module loads
const SEED_DATA = seedData();

export const useDataStore = create<DataStore>()(
  persist(
    (set, get) => ({
      clients: SEED_DATA.clients,
      apartments: SEED_DATA.apartments,
      vendors: SEED_DATA.vendors,
      products: SEED_DATA.products,
      deliveries: SEED_DATA.deliveries,
      payments: SEED_DATA.payments,
      issues: SEED_DATA.issues,
      activities: SEED_DATA.activities,
      aiNotes: SEED_DATA.aiNotes,
      manualNotes: SEED_DATA.manualNotes,

        addClient: (client) =>
          set((state) => ({
            clients: [...state.clients, { ...client, id: `client-${Date.now()}` }],
          })),

        updateClient: (id, client) =>
          set((state) => ({
            clients: state.clients.map((c) =>
              c.id === id ? { ...c, ...client } : c
            ),
          })),

        deleteClient: (id) =>
          set((state) => ({
            clients: state.clients.filter((c) => c.id !== id),
          })),

        getClient: (id) => {
          return get().clients.find((c) => c.id === id);
        },

        addVendor: (vendor) =>
          set((state) => ({
            vendors: [...state.vendors, { ...vendor, id: `vendor-${Date.now()}` }],
          })),

        updateVendor: (id, vendor) =>
          set((state) => ({
            vendors: state.vendors.map((v) =>
              v.id === id ? { ...v, ...vendor } : v
            ),
          })),

        deleteVendor: (id) =>
          set((state) => ({
            vendors: state.vendors.filter((v) => v.id !== id),
          })),

        getVendor: (id) => {
          return get().vendors.find((v) => v.id === id);
        },

        getVendorByName: (name) => {
          return get().vendors.find((v) => 
            (v.name || '').toLowerCase() === (name || '').toLowerCase()
          );
        },

        addApartment: (apartment) =>
          set((state) => ({
            apartments: [...state.apartments, { ...apartment, id: `apt-${Date.now()}` }],
          })),

        updateApartment: (id, apartment) =>
          set((state) => ({
            apartments: state.apartments.map((a) =>
              a.id === id ? { ...a, ...apartment } : a
            ),
          })),

        deleteApartment: (id) =>
          set((state) => ({
            apartments: state.apartments.filter((a) => a.id !== id),
          })),

        getApartment: (id) => {
          return get().apartments.find((a) => a.id === id);
        },

        getApartmentsByType: (type) => {
          return get().apartments.filter((a) => a.type === type);
        },

        getApartmentsByClient: (clientId) => {
          return get().apartments.filter((a) => a.clientId === clientId);
        },

        addProduct: (product) =>
          set((state) => ({
            products: [...state.products, { ...product, id: `p-${Date.now()}` }],
          })),

        addProducts: (products) =>
          set((state) => ({
            products: [
              ...state.products,
              ...products.map((p, idx) => ({ ...p, id: `p-${Date.now()}-${idx}` })),
            ],
          })),

        updateProduct: (id, product) =>
          set((state) => ({
            products: state.products.map((p) =>
              p.id === id ? { ...p, ...product } : p
            ),
          })),

        deleteProduct: (id) =>
          set((state) => ({
            products: state.products.filter((p) => p.id !== id),
          })),

        getProduct: (id) => {
          return get().products.find((p) => p.id === id);
        },

        getProductsByApartment: (apartmentId) => {
          return get().products.filter((p) => p.apartmentId === apartmentId);
        },

        addDelivery: (delivery) =>
          set((state) => ({
            deliveries: [...state.deliveries, { ...delivery, id: `del-${Date.now()}` }],
          })),

        updateDelivery: (id, delivery) =>
          set((state) => ({
            deliveries: state.deliveries.map((d) =>
              d.id === id ? { ...d, ...delivery } : d
            ),
          })),

        getDeliveriesByApartment: (apartmentId) => {
          return get().deliveries.filter((d) => d.apartmentId === apartmentId);
        },

        addPayment: (payment) =>
          set((state) => ({
            payments: [...state.payments, { ...payment, id: `pay-${Date.now()}` }],
          })),

        updatePayment: (id, payment) =>
          set((state) => ({
            payments: state.payments.map((p) =>
              p.id === id ? { ...p, ...payment } : p
            ),
          })),

        addPaymentToHistory: (id, paymentEntry) =>
          set((state) => ({
            payments: state.payments.map((p) =>
              p.id === id
                ? {
                    ...p,
                    paymentHistory: [...p.paymentHistory, paymentEntry],
                    amountPaid: p.amountPaid + paymentEntry.amount,
                    lastPaymentDate: paymentEntry.date,
                    status:
                      p.amountPaid + paymentEntry.amount >= p.totalAmount
                        ? 'Paid'
                        : 'Partial',
                  }
                : p
            ),
          })),

        getPaymentsByApartment: (apartmentId) => {
          return get().payments.filter((p) => p.apartmentId === apartmentId);
        },

        addIssue: (issue) =>
          set((state) => ({
            issues: [...state.issues, { ...issue, id: `issue-${Date.now()}` }],
          })),

        updateIssue: (id, issue) =>
          set((state) => ({
            issues: state.issues.map((i) =>
              i.id === id ? { ...i, ...issue } : i
            ),
          })),

        getIssuesByApartment: (apartmentId) => {
          return get().issues.filter((i) => i.apartmentId === apartmentId);
        },

        addActivity: (activity) =>
          set((state) => ({
            activities: [
              ...state.activities,
              { ...activity, id: `act-${Date.now()}`, timestamp: new Date().toISOString() },
            ],
          })),

        getActivitiesByApartment: (apartmentId) => {
          return get().activities.filter((a) => a.apartmentId === apartmentId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        },

        addAINote: (note) =>
          set((state) => ({
            aiNotes: [
              ...state.aiNotes,
              { ...note, id: `ai-${Date.now()}`, timestamp: new Date().toISOString() },
            ],
          })),

        getAINotesByApartment: (apartmentId) => {
          return get().aiNotes.filter((n) => n.apartmentId === apartmentId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        },

        setManualNote: (apartmentId, note) =>
          set((state) => ({
            manualNotes: { ...state.manualNotes, [apartmentId]: note },
          })),

        getManualNote: (apartmentId) => {
          return get().manualNotes[apartmentId] || '';
        },
      }),
    {
      name: 'fpms-data-storage',
    }
  )
);

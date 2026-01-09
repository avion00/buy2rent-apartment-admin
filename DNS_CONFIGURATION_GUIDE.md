# DNS Configuration Guide for procurement.buy2rent.eu

## Your Current Situation

- **Domain:** buy2rent.eu
- **Subdomain needed:** procurement.buy2rent.eu
- **Your VPS IP:** 194.163.180.84
- **Current DNS points to:** 193.58.105.67 (Hostinger's server - WRONG)

---

## Step-by-Step DNS Configuration

### Option 1: If Your Domain is Registered with Hostinger

#### 1. Log into Hostinger Control Panel (hPanel)
- Go to: https://hpanel.hostinger.com
- Log in with your Hostinger account

#### 2. Navigate to DNS Settings
- Click on **"Domains"** in the left sidebar
- Find **buy2rent.eu** and click **"Manage"**
- Click on **"DNS / Name Servers"** or **"DNS Zone"**

#### 3. Add/Edit A Record
Look for the DNS records section and:

**If "procurement" A record exists:**
- Find the A record with name `procurement` or `procurement.buy2rent.eu`
- Click **"Edit"** or the pencil icon
- Change the **"Points to"** or **"Value"** field to: `194.163.180.84`
- Set TTL to: `3600` (or leave default)
- Click **"Save"**

**If "procurement" A record doesn't exist:**
- Click **"Add Record"** or **"Add New Record"**
- Select **Type:** `A`
- **Name:** `procurement` (don't include .buy2rent.eu)
- **Points to / Value:** `194.163.180.84`
- **TTL:** `3600` (or leave default)
- Click **"Add"** or **"Save"**

#### 4. Delete Old Records (if any)
- If you see any A record for `procurement` pointing to `193.58.105.67`, delete it
- Click the trash/delete icon next to that record

---

### Option 2: If Your Domain is with Another Registrar

#### Common Registrars:

**GoDaddy:**
1. Log into GoDaddy account
2. Go to **"My Products"** → **"Domains"**
3. Click **"DNS"** next to buy2rent.eu
4. Scroll to **"Records"** section
5. Click **"Add"** or edit existing A record
   - Type: `A`
   - Name: `procurement`
   - Value: `194.163.180.84`
   - TTL: `600` or `3600`
6. Click **"Save"**

**Namecheap:**
1. Log into Namecheap account
2. Go to **"Domain List"** → Select buy2rent.eu
3. Click **"Manage"** → **"Advanced DNS"**
4. Under **"Host Records"**, click **"Add New Record"**
   - Type: `A Record`
   - Host: `procurement`
   - Value: `194.163.180.84`
   - TTL: `Automatic` or `3600`
5. Click the checkmark to save

**Cloudflare:**
1. Log into Cloudflare dashboard
2. Select buy2rent.eu domain
3. Go to **"DNS"** → **"Records"**
4. Click **"Add record"**
   - Type: `A`
   - Name: `procurement`
   - IPv4 address: `194.163.180.84`
   - Proxy status: **OFF** (gray cloud) for initial setup
   - TTL: `Auto`
5. Click **"Save"**

**Google Domains / Squarespace:**
1. Log into your account
2. Go to **"My Domains"** → Select buy2rent.eu
3. Click **"DNS"** or **"Manage"**
4. Under **"Custom records"**, add:
   - Type: `A`
   - Host name: `procurement`
   - Data: `194.163.180.84`
   - TTL: `3600`
5. Click **"Add"**

---

## Visual Guide - What to Look For

Your DNS settings should look like this:

```
┌──────────┬──────────────┬──────────────────┬──────┐
│ Type     │ Name         │ Value            │ TTL  │
├──────────┼──────────────┼──────────────────┼──────┤
│ A        │ procurement  │ 194.163.180.84   │ 3600 │
└──────────┴──────────────┴──────────────────┴──────┘
```

**Common field names you might see:**
- **Type:** A Record / A
- **Name / Host / Hostname:** procurement
- **Value / Points to / IPv4 Address / Target:** 194.163.180.84
- **TTL:** 3600 (1 hour) or Auto

---

## After Adding the DNS Record

### 1. Wait for Propagation (5-30 minutes)

DNS changes don't happen instantly. Wait at least 5-10 minutes.

### 2. Check DNS Propagation

**Method 1: Command Line**
```bash
nslookup procurement.buy2rent.eu
```

Should return:
```
Name:    procurement.buy2rent.eu
Address: 194.163.180.84
```

**Method 2: Online Tool**
Visit: https://dnschecker.org
- Enter: `procurement.buy2rent.eu`
- Check if it shows `194.163.180.84` globally

**Method 3: Simple Test**
```bash
ping procurement.buy2rent.eu
```

Should show: `PING procurement.buy2rent.eu (194.163.180.84)`

### 3. Test Your Application

Once DNS is propagated, test in browser:
```
http://procurement.buy2rent.eu
```

You should see your Buy2Rent application (not Hostinger page).

---

## Troubleshooting

### Issue: Can't Find DNS Settings

**Solution:**
- Look for sections named: "DNS", "DNS Zone", "Name Servers", "DNS Management", "Advanced DNS"
- If you can't find it, contact your domain registrar's support
- Check if your domain is using custom nameservers (should use your registrar's nameservers)

### Issue: Changes Not Taking Effect

**Possible causes:**
1. **Browser cache:** Clear browser cache or use incognito mode
2. **DNS cache:** Flush your local DNS cache:
   ```bash
   # Linux
   sudo systemd-resolve --flush-caches
   
   # Windows
   ipconfig /flushdns
   
   # Mac
   sudo dscacheutil -flushcache
   ```
3. **Still propagating:** Wait longer (up to 48 hours max, usually 5-30 minutes)
4. **Wrong nameservers:** Verify your domain is using the correct nameservers

### Issue: Record Already Exists

**Solution:**
- Edit the existing record instead of creating a new one
- Or delete the old record and create a new one

### Issue: Multiple A Records for Same Name

**Solution:**
- Delete all A records for `procurement` except the one pointing to `194.163.180.84`
- Having multiple A records can cause issues

---

## Common Mistakes to Avoid

❌ **Don't include the full domain in the name field**
- Wrong: `procurement.buy2rent.eu`
- Correct: `procurement`

❌ **Don't add http:// or https:// to the IP address**
- Wrong: `http://194.163.180.84`
- Correct: `194.163.180.84`

❌ **Don't use CNAME for root/subdomain to IP**
- Use A record for IP addresses
- CNAME is for pointing to another domain name

❌ **Don't set TTL too high initially**
- Use 3600 (1 hour) or lower for testing
- You can increase it later once everything works

---

## Quick Verification Checklist

Before saving your DNS changes, verify:

- ✅ Record Type is **A** (not CNAME, MX, TXT, etc.)
- ✅ Name/Host is **procurement** (not the full domain)
- ✅ Value/IP is **194.163.180.84** (your VPS IP)
- ✅ TTL is **3600** or **Auto**
- ✅ No other A records for `procurement` exist
- ✅ Changes are saved (click Save/Add button)

---

## After DNS is Working

Once `nslookup procurement.buy2rent.eu` returns `194.163.180.84`, run:

```bash
sudo bash /root/buy2rent/install-ssl.sh
```

This will:
- Install free SSL certificate from Let's Encrypt
- Enable HTTPS for your site
- Set up automatic certificate renewal

Then your site will be live at:
**https://procurement.buy2rent.eu** 🚀

---

## Need Help?

If you're stuck:
1. Take a screenshot of your DNS settings page
2. Note which registrar/provider you're using
3. Check if your domain uses custom nameservers
4. Contact your domain registrar's support if needed

Most registrars have live chat or ticket support available 24/7.

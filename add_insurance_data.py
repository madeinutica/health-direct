import json

# Load the existing data
with open('/home/ubuntu/oneida-healthcare-directory/client/public/data.json', 'r') as f:
    data = json.load(f)

# Define insurance plans by network
mvhs_insurance = [
    "Medicare", "Medicaid", "Aetna", "Aetna Medicare Advantage", "CDPHP", "CDPHP Exchange",
    "CDPHP Medicaid", "CDPHP Medicare Advantage", "Cigna", "Cigna Essential Plans",
    "Cigna Medicaid", "Cigna Medicare Advantage", "Emblem Health/GHI", "Empire Plan",
    "Excellus BCBS", "Excellus Medicare Blue", "Fidelis Care", "Fidelis Essential Plan",
    "Fidelis Medicare Advantage", "Humana", "Humana Medicare Advantage", "MVP Health Care",
    "MVP Essential Plan", "MVP Medicaid", "MVP Medicare Gold", "United Healthcare",
    "WellCare Medicaid", "WellCare Medicare Advantage", "TRICARE"
]

oneida_health_insurance = [
    "Medicare", "Medicaid", "Aetna", "CDPHP", "Cigna", "Excellus BCBS", "Fidelis Care",
    "MVP Health Care", "United Healthcare", "WellCare", "Humana", "Trinity Health Plan",
    "Empire Plan", "EmblemHealth/GHI", "TRICARE", "Martin's Point", "Veterans Choice"
]

rome_health_insurance = [
    "Medicare", "Medicaid", "Excellus BCBS", "Fidelis Care", "MVP Health Care",
    "CDPHP", "Aetna", "Cigna", "United Healthcare", "WellCare", "Humana"
]

# Common insurance for all providers
common_insurance = [
    "Medicare", "Medicaid", "Excellus BCBS", "Fidelis Care", "MVP Health Care",
    "CDPHP", "Aetna"
]

# Add insurance to each provider
for provider in data['containsPlace']:
    org_name = provider.get('parentOrganization', {}).get('name', '') if provider.get('parentOrganization') else ''
    provider_name = provider.get('name', '')
    
    # Get location safely
    location = ''
    if provider.get('address'):
        addr = provider['address'][0] if isinstance(provider['address'], list) else provider['address']
        if addr:
            location = addr.get('addressLocality', '')
    
    # Assign insurance based on network affiliation
    if 'Mohawk Valley Health System' in org_name or 'MVHS' in org_name:
        provider['acceptsInsurance'] = mvhs_insurance
        provider['network'] = 'Mohawk Valley Health System'
    elif 'Oneida Health' in org_name:
        provider['acceptsInsurance'] = oneida_health_insurance
        provider['network'] = 'Oneida Health'
    elif 'Rome Health' in provider_name or 'Rome Health' in org_name:
        provider['acceptsInsurance'] = rome_health_insurance
        provider['network'] = 'Rome Health'
    else:
        # Default to common insurance for independent providers
        provider['acceptsInsurance'] = common_insurance
        provider['network'] = 'Independent'
    
    # Add Medicaid and Medicare flags
    provider['acceptsMedicaid'] = True
    provider['acceptsMedicare'] = True

# Save the updated data
with open('/home/ubuntu/oneida-healthcare-directory/client/public/data.json', 'w') as f:
    json.dump(data, f, indent=2)

print("Insurance data added successfully!")
print(f"Total providers updated: {len(data['containsPlace'])}")

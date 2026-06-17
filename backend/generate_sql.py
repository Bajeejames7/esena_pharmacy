import os

PRODUCTS_DIR = '/home/bajee/esena_pharmacy/backend/uploads/products/'
OUTPUT_FILE = '/home/bajee/esena_pharmacy/backend/ESENA PHARMACY PRODUCTION producs.txt'

def categorize(fn):
    f = fn.lower()
    n = fn.replace('.webp', '')

    # --- Dewormers ---
    if fn.startswith('ABZ') or 'albendazole' in f or 'zentel' in f or 'mebendazole' in f or 'natoa' in f:
        return 'Dewormers'

    # --- Antimalarials ---
    if 'artequick' in f or 'p-alaxin' in f or 'dihydroartemisinin' in f or 'piperaquine' in f:
        return 'Antimalarials'

    # --- Antibiotics ---
    if any(k in f for k in ['amoxicillin','amoxil','kemoxyl','elymox','medicloamp','augmentin',
        'enhancin','acinet','finemox cv','ampiclo','ciprofloxacin','ciproken','ceprolen',
        'levobact','azithromycin','agycin','zithrox','zimarc-500','clarithromycin','clariwin',
        'metronidazole','tricozole','dazolic','eflaron','co-trimoxazole','cosatrim','biotrim',
        'ofloxacin','ojen-oz','shalcip','bactifix','tetracycline','tracy','grabacin',
        'clindamycin','clear-t','diracip','atm 200','atm 500']):
        return 'Antibiotics'

    # --- DiabetesCare ---
    if any(k in f for k in ['metformin','glucophage','glucomet','glibenclamide','nogluc',
        'empagliflozin','empiget','sitagliptin','treviamet','gliclazide','diamicron']):
        return 'DiabetesCare'

    # --- HeartAndBP ---
    if any(k in f for k in ['amlodipine','amlozaar','amolab','losartan','carditan','presartan',
        'varinil','bisoprolol','concor ','carvedilol','vidol','enaril','enalapril',
        'nebilong','nifedi-denk','propranolol','ivabradine','ivadin',
        'spironolactone','aldactone','hydrochlorothiazide','furosemide']):
        return 'HeartAndBP'

    # --- Allergy ---
    if any(k in f for k in ['cetirizine','rinacet','zyncet','zyrtec','atrizin','loratadine',
        'clarityne','lorhistina','clarinase','desloratadine','aerius','deslit','desostar',
        'fexofenadine','fexet','chlorpheniramine','piriclor','piriton',
        'rupatadine','rupatine','erostin','ebastine','oculast','azelastine',
        'olopat','olopatadine','cyproheptadine','becoactin','cypro b',
        'cadistin','letzgo - mr','levolukast','l montus','montebasto',
        'montecor plus','monteru','montiget']):
        return 'Allergy'

    # --- Chronic (asthma inhalers, thyroid, statins, etc.) ---
    if any(k in f for k in ['ventolin','azmasol','aerovent','foralin','flusort','flonaspray',
        'euthyrox','avas-20','statin','beclometa','gifol','theophylline','levolukast']):
        return 'Chronic'

    # --- PainRelief ---
    if any(k in f for k in ['ibuprofen','paracetamol','diclofenac','mefenamic','meftal',
        'ketoprofen','fastum','celecoxib','celebrex','etoricoxib','ecofree','etorix','cox b',
        'beecox','acepar','aclosara','action tembe','adol ','brufen','brustan','bustan',
        'capsifenac','cataflam','cipladon','cetamol','curamol','daprofen','diclo-denk',
        'diclomol','doloact','dynapar','ecofree','efferalgan','emanzen','enzoflam',
        'etoxym','febo-g','fenplus','fevapyn','gesic adl','gofen','kaluma',
        'ketesse','lobak','lysoflam','meftal','myospaz','panadol','parafast','parol',
        'ponstan','powergesic','profen','rilif','rufenac','serrazen','texamol',
        'thiorelax','thiozone','coscof','deep heat','deep relief']):
        return 'PainRelief'

    # --- ColdAndFlu ---
    if any(k in f for k in ['expectorant','cough','cold','flu','mucolytic','bromsal','brozelin',
        'ascoril','ambrox','dawahist','delased','flu-gone','flu - gone',
        'glykof','good morning lung','herbigor','shaltoux','thiocarb',
        'toufcof','tricohist','tridex','tuspel','vithiol','coscof',
        'cofta','coldcap','dacof','nosfree saline']):
        return 'ColdAndFlu'

    # --- Diarrhoea ---
    if any(k in f for k in ['loperamide','coramide','nitazoxanide','netazox','entamaxin',
        'dyrade']):
        return 'Diarrhoea'

    # --- DigestiveHealth ---
    if any(k in f for k in ['antacid','omeprazole','esomeprazole','pantoprazole','rabeprazole',
        'lansoprazole','vonoprazan','alugel','allucid','aprazole','catoxymag','cosmag',
        'dupbalac','duphalac','dulcolax','eno ','gaviscon','gastro gel','gastro plus',
        'git-plus','klean','lactitoss','livoluk','maalox','magnacid','nilacid',
        'ocid','omis','pantocid','pepsol','protas','risek','sucrafil','ulgicid',
        'esofag','esomod','esomac','esome ','nexium','lanzol','buscopan','bispanol',
        'cyclopam','spasmopriv','spasmomen','neopeptine','glyso','enterogermina',
        'vono-q','metoclopramide','emeton','ondansetron','emitoss','emitino',
        'anusol','cital']):
        return 'DigestiveHealth'

    # --- SkinConditions ---
    if any(k in f for k in ['bioscab','scabies','benzyl benzoate','griseofulvin','grisozen',
        'acnesol','betason','betamethasone','candid-b','clob ','clotrimazole',
        'clotrine','clozole','dazole','fungistat','funbact','intamine',
        'epiderm','enat ','norash','mediven','momate','pernex','terbibact',
        'exevate','beclomin']):
        # but MedicatedSkinCare if it's a combo (steroid+antifungal+antibiotic)
        if any(k in f for k in ['cosvate','sonaderm','xtraderm','bulkot','zupricin-b',
            'clotrine-b','dazole-b','candid-b','celabet','vilestamine','probeta',
            'diproson']):
            return 'MedicatedSkinCare'
        return 'SkinConditions'

    # --- MedicatedSkinCare ---
    if any(k in f for k in ['cosvate','sonaderm','xtraderm','bulkot-mixi','zupricin-b',
        'clotrine-b','dazole-b','celabet','vilestamine','probeta-n','tacrovate',
        'exevate-mf','beclomin']):
        return 'MedicatedSkinCare'

    # --- EyeAndEarCare ---
    if any(k in f for k in ['eye','ear','ophthalmic','ocular','maxitrol','dextracin',
        'diclogenta','ceprolen','ciproken','oculast','olopat','floral','ketolac',
        'otorex','lubtear','tracy','probeta-n']):
        return 'EyeAndEarCare'

    # --- OralHealth ---
    if any(k in f for k in ['mouthwash','oral rinse','dental','andolex','bestdin',
        'bonjela','chx gel','dentogel','medi-keel','nystal','peardine',
        'quadrajel','remidin','sonatec']):
        return 'OralHealth'

    # --- Supplements ---
    if any(k in f for k in ['vitamin','supplement','actilife cdz','actilife women',
        'nat b','enervit','evit 400','glencee','ginsomin','dynamogen',
        'saracal','sara-d3','scott','ranferon','vitaglobin','cartimove',
        'osteocerin','saferon','ferrous','folisure','ifas','ferrolic',
        'trimetabol','tres-orix','cypon','homagon','zincat','just zinc',
        'purecal']):
        return 'Supplements'

    # --- Omega3 ---
    if any(k in f for k in ['omega','seven seas','cod liver','fish oil']):
        return 'Omega3'

    # --- ImmuneSupport ---
    if any(k in f for k in ['immune','septilin','echinacea','engystol']):
        return 'ImmuneSupport'

    # --- TestKits ---
    if any(k in f for k in ['hiv 1+2','test cassette','test strip','pregnancy test',
        'on call plus blood glucose test strip']):
        return 'TestKits'

    # --- Glucometers ---
    if 'glucometer' in f or 'blood glucose monitor' in f:
        return 'Glucometers'

    # --- BabyMedicines ---
    if any(k in f for k in ['babymol','gripe water','beta gripe','bonjela','glyso',
        'epimax baby','neopeptine']):
        return 'BabyMedicines'

    # --- PrenatalCare ---
    if any(k in f for k in ['prenatal','folic acid','ferrolic','ifas ferrous',
        'ranferon','vitaglobin']):
        return 'PrenatalCare'

    # --- Contraceptives ---
    if any(k in f for k in ['condom','durex','kiss ','kiss chocolate','kiss studded',
        'kiss strawberry','trust ribbed','ecee 2','levonorgestrel','postinor']):
        return 'Contraceptives'

    # --- FeminineHealth ---
    if any(k in f for k in ['vaginal','candid-v','femiflora','kly ','ky jelly',
        'duphaston','progesterone','susten','primolut','diane 35','feminine']):
        return 'FeminineHealth'

    # --- WoundCare ---
    if any(k in f for k in ['velvex','cotton wool','dressing','plaster','crownplast',
        'futcare corn caps','zupricin 15g','silver sulf']):
        return 'WoundCare'

    # --- Antiseptics ---
    if any(k in f for k in ['surgical spirit','diarim','faholo surgical','faholo liquid paraffin',
        'impact tincture','iodine','betadine','dettol','savlon','hydrogen peroxide']):
        return 'Antiseptics'

    # --- PersonalCare ---
    if any(k in f for k in ['cerave','anthelios','akshar','mask','syringe','e-j euro',
        'nescopharm','proto mask','disposable','face mask']):
        return 'PersonalCare'

    # --- MosquitoProtection ---
    if any(k in f for k in ['mosquito','deet','insect repel']):
        return 'MosquitoProtection'

    # --- Prescription last resort ---
    if any(k in f for k in ['prednisolone','clomid','duphaston','primolut','susten',
        'diane 35','furosemide','hydrochlorothiazide','sildenafil','tadalafil',
        'euthyrox','tacrovate','univir','acyclovir','nifedipine','nifedi-denk',
        'nosic','doxylamine','mtm-50','talgentis','folisure','concor',
        'propranolol','ivabradine','aldactone','spironolactone',
        'dopamac','emeton metoclopramide','emitoss','emitino','stugeron']):
        return 'Prescription'

    return 'OTC'


def clean_name(fn):
    n = fn.replace('.webp', '')
    # Normalize spacing around 'per_' artifacts
    n = n.replace(' per_ ', '/').replace(' per_', '/').replace('per_ ', '/')
    # Remove duplicate type words at end like "Tablets Tablets", "Caplets Caplets"
    import re
    n = re.sub(r'\b(Tablets|Capsules|Caplets|Liquid|Suspension|Syrup|Cream|Ointment|Gel|Drops|Inhaler|Suppositories|Condoms|Powder|Solution|Lozenges|Sachet|Sachets|Plaster|Pack|Strips|Strip)\s+\1\b', r'\1', n)
    return n.strip()


DESCRIPTIONS = {
    'ABZ 10 ml Oral Suspension Single Dose Pack.webp': 'Albendazole 10ml oral suspension in a single-dose pack for treating intestinal worm infections including roundworm, hookworm, and whipworm.',
    'ABZ 1 Tablet Tablets.webp': 'Albendazole single chewable tablet for treatment of intestinal worm infections in adults and children.',
    'Acepar 100mg 500mg 1 x 10 Caplets.webp': 'Aceclofenac 100mg and Paracetamol 500mg combination tablets for relief of pain and inflammation in conditions such as arthritis and musculoskeletal pain.',
    'ACEPAR-MR 100mg 500mg 375mg 10 Caplets Caplets.webp': 'Aceclofenac, Paracetamol, and Chlorzoxazone combination tablets for pain relief and muscle spasm.',
    'Acepar SP 100mg 15mg 500mg 10 Caplets Caplets.webp': 'Aceclofenac, Serratiopeptidase, and Paracetamol combination for pain relief and reduction of inflammation and swelling.',
    'ACINET 1000 Amoxicillin Clavulanate Potassium 1 Blister Strip of 10 Tablets.webp': 'Amoxicillin 875mg/Clavulanate 125mg broad-spectrum antibiotic tablets for treating bacterial infections including respiratory tract, urinary tract, and skin infections.',
    'ACINET 375 10 Tablets Tablets.webp': 'Amoxicillin 250mg/Clavulanate 125mg antibiotic tablets for mild-to-moderate bacterial infections.',
    'ACINET DRY SYRUP 457mg_5mL 100 ml Oral Suspension.webp': 'Amoxicillin/Clavulanate dry syrup for oral suspension, used in bacterial infections in children including ear, throat, and chest infections.',
    'Aclosara-MR 10 Tablets Tablets.webp': 'Aceclofenac and muscle relaxant combination tablets for pain relief and muscle spasm associated with musculoskeletal disorders.',
    'Acnesol 25g Cream.webp': 'Clindamycin phosphate gel for topical treatment of acne vulgaris.',
    'Actilife CDZ 20 Tablets Effervescent Tablets.webp': 'Effervescent supplement tablets containing calcium, vitamin D, and zinc to support bone health and immune function.',
    "Actilife WOMEN'S FLORA 30 Billion CFU 15 Vegetarian Capsules Capsules.webp": "Probiotic supplement with 30 billion CFU specifically formulated to support women's digestive and vaginal flora.",
    'ACTION Tembe 100 Tablets.webp': 'Paracetamol 500mg tablets for the relief of mild to moderate pain and fever.',
    'adol Paracetamol 125 mg 10 suppositories Suppositories.webp': 'Paracetamol 125mg rectal suppositories for fever and pain relief in infants and young children who cannot take oral medication.',
    'AERIUS 0.5 mg per ml 60 ml oral solution.webp': 'Desloratadine 0.5mg/ml oral solution for relief of allergy symptoms including hay fever and urticaria in children.',
    'AERIUS Desloratadine 5 mg 30 Tablets film-coated tablets.webp': 'Desloratadine 5mg non-drowsy antihistamine for relief of allergic rhinitis and chronic urticaria.',
    'aerovent Beclometasone and Salbutamol 200 metered doses inhaler.webp': 'Combined beclometasone (inhaled corticosteroid) and salbutamol (bronchodilator) inhaler for asthma management.',
    'AGYCIN-500 Azithromycin USP 500 mg 3 Tablets Tablets.webp': 'Azithromycin 500mg antibiotic tablets for treating respiratory infections, skin infections, and sexually transmitted infections.',
    'Akshar Disposable Surgical Face Mask 3PLY Ear Loop 50 PCS Mask.webp': '3-ply disposable surgical face masks with ear loops, pack of 50, for protection against airborne particles.',
    'Aldactone Spironolactone B.P. 25mg 100 Tablets.webp': 'Spironolactone 25mg potassium-sparing diuretic used for heart failure, hypertension, and fluid retention.',
    'Allucid Antacid 100ml Oral Suspension.webp': 'Antacid oral suspension for relief of heartburn, acid indigestion, and stomach upset.',
    'ALUGEL 100ml Suspension.webp': 'Aluminium hydroxide antacid suspension for neutralising excess stomach acid and relieving heartburn.',
    'ALUGEL PLUS 200ml Suspension.webp': 'Aluminium hydroxide and magnesium hydroxide antacid suspension for relief of indigestion and heartburn.',
    'Ambrox 15mg per 5ml Syrup.webp': 'Ambroxol 15mg/5ml syrup, a mucolytic expectorant that helps thin and loosen mucus to relieve productive coughs.',
    'Amlozaar-H Amlodipine 5mg Losartan Potassium 50mg Hydrochlorothiazide 12.5mg 3 x 10 Tablets.webp': 'Triple combination of amlodipine, losartan, and hydrochlorothiazide for control of hypertension.',
    'Amlozaar Losartan Potassium 50mg Amlodipine 5mg 3 x 10 Tablets.webp': 'Combination of losartan 50mg and amlodipine 5mg for the treatment of high blood pressure.',
    'Amolab-5 Amlodipine 5mg 3 x 10 Tablets.webp': 'Amlodipine 5mg calcium channel blocker for treatment of hypertension and angina.',
    'Amoxil Forte 250mg per 5mL 100ml Powder for Oral Suspension.webp': 'Amoxicillin 250mg/5ml suspension for treating bacterial infections in children including ear, chest, and throat infections.',
    'Ampiclo-Dawa Ampicillin Cloxacillin 250mg per 5ml 100ml For Oral Suspension.webp': 'Ampicillin and cloxacillin combination oral suspension for bacterial infections, effective against both gram-positive and gram-negative organisms.',
    'Ampiclo-Dawa Ampicillin Cloxacillin 90mg per 0.6ml 10ml Neonatal Oral Drops.webp': 'Ampicillin and cloxacillin combination oral drops formulated for neonates and infants.',
    'Andolex-C Oral Rinse 200ml Liquid.webp': 'Benzydamine and chlorhexidine antiseptic oral rinse for treatment of mouth ulcers, sore throat, and oral infections.',
    'Anthelios UVMUNE 400 SPF 50+ 50 ml Crème Hydratante.webp': "La Roche-Posay Anthelios SPF 50+ broad-spectrum sunscreen moisturiser for daily sun protection of the face.",
    'AnuSol 11.8 Suppositories.webp': 'Anugesic suppositories for soothing relief of haemorrhoids, rectal discomfort, and itching.',
    'APRAZOLE PLUS-20 20 Sachets x 6 g Powder for oral suspension.webp': 'Omeprazole 20mg sachets for dissolving in water, used to treat acid reflux, peptic ulcers, and GERD.',
    'ARTEQUICK 4 Tablets.webp': 'Artemisinin-based antimalarial combination tablets for treatment of uncomplicated malaria.',
    'Ascoril Expectorant 100 ml Syrup.webp': 'Expectorant syrup containing salbutamol, guaifenesin, and bromhexine for productive coughs and chest congestion.',
    'Ascoril Expectorant 200 ml Syrup.webp': 'Expectorant syrup containing salbutamol, guaifenesin, and bromhexine for productive coughs and chest congestion, 200ml bottle.',
    'ATM 200 15ml Suspension.webp': 'Azithromycin 200mg/5ml suspension for treating bacterial infections in children.',
    'ATM 500 500 mg 1 x 3 Tablets.webp': 'Azithromycin 500mg tablets, a 3-day course antibiotic for respiratory, skin, and other bacterial infections.',
    'Atrizin 5mg per 5ml 60ml SYRUP.webp': 'Cetirizine 5mg/5ml antihistamine syrup for relief of hay fever, allergic rhinitis, and urticaria in children.',
    'AUGMENTIN 1g 14 film-coated tablets Tablets.webp': 'Amoxicillin 875mg/Clavulanate 125mg film-coated tablets, broad-spectrum antibiotic for respiratory, urinary, and skin infections.',
    'AUGMENTIN 228mg per 5mL 70ml Powder for Oral Suspension.webp': 'Amoxicillin/Clavulanate paediatric oral suspension for bacterial infections in children.',
    'AUGMENTIN 625mg 14 film-coated tablets Tablets.webp': 'Amoxicillin 500mg/Clavulanate 125mg antibiotic tablets for treating moderate bacterial infections.',
    'AVAS-20 20mg 3 x 10 Tablets.webp': 'Atorvastatin 20mg tablets for lowering cholesterol and reducing the risk of cardiovascular events.',
}

DESCRIPTIONS.update({
    'AXE BRAND UNIVERSAL OIL 3ml Liquid.webp': 'Traditional topical remedy for temporary relief of minor headaches, muscle aches, and dizziness.',
    'AZMASOL HFA 100µg 200 Metered Inhalations Inhaler.webp': 'Salbutamol (albuterol) 100mcg pressurised inhaler for rapid relief of bronchospasm in asthma and COPD.',
    'BABYMOL SUSPENSION 100ml Suspension.webp': 'Paracetamol suspension for fever and pain relief in infants and young children.',
    'BACTIFIX 200 200mg 1 x 10 Tablets.webp': 'Ofloxacin 200mg antibiotic tablets for urinary tract infections and other bacterial infections.',
    'BACTIFIX 400 400mg 1 x 10 Tablets.webp': 'Ofloxacin 400mg antibiotic tablets for treating respiratory and urinary tract infections.',
    'BECLOMIN Beclomethasone Miconazole and Neomycin Ointment 15g.webp': 'Triple-action ointment combining a corticosteroid (beclomethasone), antifungal (miconazole), and antibiotic (neomycin) for mixed skin infections.',
    'Becoactin Cyproheptadine Hydrochloride U.S.P. 4 mg 3 X 10 CAPLETS Tablets.webp': 'Cyproheptadine 4mg antihistamine tablets that also act as an appetite stimulant for underweight patients.',
    'Becoactin CYPROHEPTADINE with Vitamins B-Complex Appetite Stimulant Syrup 200ml Liquid.webp': 'Cyproheptadine with B-complex vitamins appetite stimulant syrup for children and adults with poor appetite.',
    'BEECOX MR Celecoxib 200mg Paracetamol 325mg and Chlorzoxazone 250mg 10 Tablets.webp': 'COX-2 inhibitor (celecoxib), paracetamol, and muscle relaxant (chlorzoxazone) combination for musculoskeletal pain and spasm.',
    'BEECOX PLUS Celecoxib 200mg and Paracetamol 325mg 10 Capsules.webp': 'Celecoxib 200mg and paracetamol 325mg combination for relief of pain and inflammation.',
    'Bestdin Povidone Iodine B.P. 1 per_ w per_ v Antiseptic Mouthwash Gargle Cleanser 100ml Liquid.webp': 'Povidone-iodine 1% antiseptic mouthwash and gargle for oral hygiene and treatment of mouth and throat infections.',
    'Beta Gripe Water Liquid 60ml.webp': 'Gripe water oral solution for relief of colic, wind, and infant digestive discomfort.',
    'Betason Betamethasone Cream 15g.webp': 'Betamethasone valerate topical corticosteroid cream for treatment of inflammatory and itchy skin conditions such as eczema and dermatitis.',
    'BIOSCAB Benzyl Benzoate Application 25 per_ w per_ v Treatment of Scabies 100ml Liquid.webp': 'Benzyl benzoate 25% lotion for topical treatment of scabies and lice infestations.',
    'Biotrim Co-trimoxazole Suspension 100ml.webp': 'Co-trimoxazole (trimethoprim/sulfamethoxazole) antibiotic suspension for urinary tract infections and other bacterial infections.',
    'Biotrim Co-trimoxazole Suspension 50ml.webp': 'Co-trimoxazole antibiotic suspension 50ml for treating bacterial infections including UTIs and chest infections.',
    'Bispanol Hyoscine Butylbromide Anti-Spasmodic Elixir 100ml.webp': 'Hyoscine butylbromide antispasmodic elixir for relief of abdominal cramps and spasms.',
    'Bonjela Soothing Teething Gel.webp': 'Choline salicylate gel for soothing teething pain and minor mouth ulcers in infants.',
    'Bromsal Expectorant Bronchodilator Mucolytic 100ml.webp': 'Expectorant and mucolytic syrup to help loosen and clear mucus from the airways in productive coughs.',
    'Brozelin Ambroxol Salbutamol & Guaifenesin Expectorant 100ml.webp': 'Combination expectorant with ambroxol, salbutamol, and guaifenesin for productive coughs with bronchospasm.',
    'Brufen 100mg per_ 5ml Ibuprofen Paediatric Suspensie 100ml.webp': 'Ibuprofen 100mg/5ml paediatric oral suspension for fever and mild to moderate pain in children.',
    'Brustan Ibuprofen and Paracetamol 10 Tablets.webp': 'Ibuprofen and paracetamol combination tablets for stronger pain and fever relief.',
    'Brustan Ibuprofen and Paracetamol Suspension 100ml.webp': 'Ibuprofen and paracetamol suspension for children for combined pain and fever relief.',
    'Bulkot-Mixi Broad Spectrum Anti-Fungal Anti-Bacterial & Anti-Inflammatory Cream 20g.webp': 'Broad-spectrum topical cream combining antifungal, antibacterial, and anti-inflammatory agents for mixed skin infections.',
    'Buscopan 10mg 50 Tablets.webp': 'Hyoscine butylbromide 10mg tablets for relief of abdominal spasms and cramps.',
    'Buscopan PLUS Hyoscine Butylbromide 10 MG per_ Paracetamol 500 MG 40 Film-Coated Tablets.webp': 'Hyoscine butylbromide 10mg and paracetamol 500mg tablets for spasmodic pain relief.',
    'CACHCET 10mg 2 x 5 x 10 Tablets.webp': 'Amlodipine 10mg calcium channel blocker tablets for treatment of hypertension and angina.',
    'CADISTIN PLUS 100 ml Liquid.webp': 'Antihistamine and decongestant syrup for relief of cold and allergy symptoms including runny nose and congestion.',
    'Calpol Liquid.webp': 'Paracetamol suspension for fever and pain relief in children.',
    'Candid-B 15 g Cream.webp': 'Clotrimazole 1% and betamethasone dipropionate 0.05% cream for fungal skin infections with inflammation.',
    'Candid-TV Clotrimazole 1 per_ w_v Selenium Sulfide 2.5 per_ w_v Suspension.webp': 'Clotrimazole and selenium sulfide suspension for treatment of tinea versicolor (pityriasis) and other fungal skin infections.',
    'Candid-V3 3 Vaginal Inserts.webp': 'Clotrimazole 200mg vaginal pessaries for treatment of vaginal thrush (candidiasis), 3-day course.',
    'Candid-V6 Vaginal Inserts.webp': 'Clotrimazole 100mg vaginal pessaries for treatment of vaginal candidiasis, 6-day course.',
    'CANDITRAL 100 mg 3 STRIPS OF 4 CAPSULES.webp': 'Itraconazole 100mg capsules for systemic fungal infections including oral and vaginal candidiasis.',
    'Capsifenac Gel 20g.webp': 'Diclofenac topical gel for local relief of pain and inflammation in musculoskeletal conditions.',
    'Carditan Losartan Potassium 50mg 28 Tablets.webp': 'Losartan 50mg angiotensin receptor blocker for treatment of hypertension and diabetic nephropathy.',
    'Cartimove-D Glucosamine Methylsulfonylmethane Hyaluronic acid and Diacerein 10 Tablets.webp': 'Joint supplement combining glucosamine, MSM, hyaluronic acid, and diacerein for osteoarthritis and joint health.',
    'Cartimove Glucosamine MSM Chondroitin Multivitamin Multimineral and Antioxidant 30 Tablets.webp': 'Comprehensive joint support supplement with glucosamine, chondroitin, MSM, vitamins, and minerals.',
    'Cataflam 50mg 100 Coated Tablets.webp': 'Diclofenac potassium 50mg fast-acting anti-inflammatory tablets for pain, fever, and inflammation.',
    'Catoxymag-N Antacid Antiflatulent 200ml Suspension.webp': 'Antacid and antiflatulent suspension for relief of heartburn, bloating, and excess gas.',
    'Celabet Betamethasone and Dexchlorpheniramine 30 Tablets.webp': 'Betamethasone (corticosteroid) and dexchlorpheniramine (antihistamine) combination for allergic reactions and inflammatory conditions.',
    'Celebrex 200mg 10 Capsules.webp': 'Celecoxib 200mg COX-2 selective anti-inflammatory capsules for arthritis, pain, and inflammation.',
    'Ceprolen Ciprofloxacin Hydrochloride Solution 5ml Eye Ear Drops.webp': 'Ciprofloxacin 0.3% eye and ear drops for bacterial infections of the eye and ear.',
    'CeraVe Hydrating Cleanser 236ml Liquid.webp': 'CeraVe non-stripping hydrating facial cleanser with ceramides and hyaluronic acid for normal to dry skin.',
    'CETAMOL Paracetamol 10 x 10 Tablets.webp': 'Paracetamol 500mg tablets for relief of mild to moderate pain and reduction of fever.',
    'CETAMOL Paracetamol Syrup.webp': 'Paracetamol syrup for fever and pain relief in children.',
    'CHX gel Chlorhexidine Digluconate Gel 7.1per_ 10g.webp': 'Chlorhexidine digluconate 7.1% gel for treatment of gum disease, mouth ulcers, and post-dental procedure care.',
    'CIPLADON 1000 Paracetamol 8 Effervescent Tablets.webp': 'Paracetamol 1000mg effervescent tablets for quick-dissolving pain and fever relief.',
    'CIPLADON 500 Paracetamol 16 Effervescent Tablets.webp': 'Paracetamol 500mg effervescent tablets for fast-dissolving pain and fever relief.',
    'CIPROKEN Ciprofloxacin USP 0.3 per_ 5 ml Eye Ear Drops.webp': 'Ciprofloxacin 0.3% eye and ear drops for bacterial conjunctivitis and outer ear infections.',
    'Cital Disodium Hydrogen Citrate 100ml Liquid.webp': 'Disodium hydrogen citrate alkalinising agent for relief of urinary discomfort and burning sensation in urinary tract infections.',
    'CLARINASE Loratadine and Pseudoephedrine 14 Repetabs Tablets.webp': 'Loratadine 5mg and pseudoephedrine 120mg combination for allergic rhinitis with nasal congestion.',
    'CLARITYNE Loratadine 10 mg 10 Tablets.webp': 'Loratadine 10mg non-sedating antihistamine for hay fever, allergic rhinitis, and urticaria.',
    'CLARIWIN-500 Clarithromycin 500 mg 1 x 10 Tablets.webp': 'Clarithromycin 500mg macrolide antibiotic for respiratory infections, H. pylori eradication, and skin infections.',
})

DESCRIPTIONS.update({
    'Clear-T Clindamycin & Tretinoin Gel 20g.webp': 'Clindamycin and tretinoin combination gel for treating acne vulgaris by reducing bacteria and promoting skin cell turnover.',
    'CLOB Clotrimazole Cream USP 1 per_ w per_ w 15g.webp': 'Clotrimazole 1% antifungal cream for athlete''s foot, ringworm, jock itch, and other fungal skin infections.',
    'Clomid 50 mg 10 tablets.webp': 'Clomifene citrate 50mg for induction of ovulation in women with infertility due to anovulation.',
    'Clotrine-B Betamethasone & Clotrimazole Cream.webp': 'Betamethasone and clotrimazole combination cream for fungal skin infections with inflammation.',
    'Clozole-B Cream 15g.webp': 'Clotrimazole and betamethasone combination cream for inflammatory fungal skin conditions.',
    'cofluc 150 Fluconazole 150mg 1 Capsule.webp': 'Fluconazole 150mg single-dose capsule for treatment of vaginal thrush and oral candidiasis.',
    'Cofta For Coughs and Colds 100 Tablets.webp': 'Antitussive and decongestant tablets for symptomatic relief of coughs and cold.',
    'Coldcap Syrup FOR CHILDREN 100 ml.webp': 'Paediatric cough and cold syrup for relief of congestion, runny nose, and cough in children.',
    'Concor 5 5 mg 30 Tablets.webp': 'Bisoprolol 5mg beta-blocker for treatment of hypertension, heart failure, and angina.',
    'CORAMIDE LOPERAMIDE HYDROCHLORIDE 2mg 6 Capsules.webp': 'Loperamide 2mg capsules for controlling acute diarrhoea and chronic diarrhoea.',
    'Cosatrim DS Co-trimoxazole 800 per_ 160 mg 100 Tablets.webp': 'Co-trimoxazole double-strength 800mg/160mg tablets for urinary tract infections, chest infections, and PCP prophylaxis.',
    'coscof-DM LINCTUS with Dextromethorphan Dry Coughs Honey Base 100mL Liquid.webp': 'Dextromethorphan-based cough linctus in a honey base for dry, irritating coughs.',
    'coscof EXPECTORANT Original Honey Base 100mL Liquid.webp': 'Expectorant cough syrup in a honey base for productive coughs with mucus.',
    'Cosmag Chewable Antacid Tablets Compound Magnesium Trisilicate Tablets 100 Tablets.webp': 'Magnesium trisilicate chewable antacid tablets for heartburn, indigestion, and excess stomach acidity.',
    'Cosvate-GM Clobetasol Propionate Gentamicin and Miconazole Nitrate Cream 15g.webp': 'Triple combination cream with clobetasol (steroid), gentamicin (antibiotic), and miconazole (antifungal) for mixed skin infections.',
    'Cox B-200 Celecoxib 200mg 50 Capsules.webp': 'Celecoxib 200mg COX-2 inhibitor for osteoarthritis, rheumatoid arthritis, and pain management.',
    'CROWNPLAST Zinc Oxide Adhesive Plaster 2 inch 5.0cm x 3.6m 1PC Plaster.webp': 'Zinc oxide adhesive plaster 5cm x 3.6m for secure wound dressing and strapping.',
    'CROWNPLAST Zinc Oxide Adhesive Plaster 3 inch 7.5cm x 3.6m 1PC Plaster.webp': 'Zinc oxide adhesive plaster 7.5cm x 3.6m for wound care and support strapping.',
    'CROWNPLAST Zinc Oxide Adhesive Plaster 4 inch 10cm x 3.6m 1PC Plaster.webp': 'Zinc oxide adhesive plaster 10cm x 3.6m for larger wound dressings and bandaging.',
    'CROWNPLAST Zinc Oxide Adhesive Plaster 6 inch 15cm x 3.6m 1PC Plaster.webp': 'Wide zinc oxide adhesive plaster 15cm x 3.6m for broad wound coverage and strapping.',
    'Curamol Suspension Paracetamol BP 120mg per_ 5ml 60ml Liquid.webp': 'Paracetamol 120mg/5ml oral suspension for fever and pain relief in infants and small children.',
    'Curamol Suspension Paracetamol BP 120mg per_ 5ml FOR CHILDREN 100ml Liquid.webp': 'Paracetamol 120mg/5ml oral suspension 100ml for fever and pain relief in children.',
    'CYCLOPAM - P Dicycloverine Hydrochloride & Paracetamol Tablets 20 Tablets.webp': 'Dicyclomine (antispasmodic) and paracetamol combination for relief of abdominal pain and spasm.',
    'CYPON 200 ml Syrup.webp': 'Cyproheptadine-based vitamin and appetite stimulant syrup 200ml for underweight children and adults.',
    'CYPON SYRUP 100ml Liquid.webp': 'Cyproheptadine appetite stimulant syrup 100ml for improving appetite and promoting weight gain.',
    'Cypro B Plus Cyproheptadine with Vitamin B-Complex Appetite Stimulant Syrup 200ml Liquid.webp': 'Cyproheptadine with B-complex vitamins appetite stimulant syrup to improve appetite in children and adults.',
    'DACOF Sec 100ml Syrup.webp': 'Antitussive cough syrup for dry, irritating coughs.',
    'DAPROFEN 100mg per 5ml 60ml Oral Suspension.webp': 'Ibuprofen 100mg/5ml paediatric oral suspension for fever and pain relief.',
    'DAWAHIST 100ml Expectorant Syrup.webp': 'Expectorant antihistamine syrup for coughs associated with upper respiratory tract infections and allergies.',
    'DAZOLE 20g Cream.webp': 'Clotrimazole antifungal cream for ringworm, athlete''s foot, and other fungal skin infections.',
    'DAZOLE-B Clotrimazole 1.0 per_ p per_p Betamethasone 0.05 per_ p per_p 20gm Crème.webp': 'Clotrimazole 1% and betamethasone 0.05% combination cream for inflamed fungal skin infections.',
    'DEEP HEAT 35g Rub.webp': 'Topical analgesic rub with methyl salicylate and menthol for muscle aches, stiffness, and minor joint pain.',
    'DEEP HEAT Period Pain Patch.webp': 'Heat patch for localised relief of menstrual cramps and period pain.',
    'DEEP RELIEF DUO PAIN RELIEF GEL Ibuprofen and Levomenthol Liquid.webp': 'Ibuprofen and levomenthol combination gel for targeted pain and inflammation relief in muscles and joints.',
    'DELASED 100 ml Syrup.webp': 'Expectorant cough syrup for relief of mucus congestion and productive coughs.',
    'DELASED DRY COUGHS 100 ml Liquid.webp': 'Antitussive cough syrup for dry, non-productive coughs.',
    'DELASED PAEDIATRIC 100 ml Liquid.webp': 'Paediatric cough and cold syrup for relieving respiratory symptoms in children.',
    'Dentogel 10g Antiseptic Pain Relieving Dental Gel.webp': 'Benzocaine-containing antiseptic dental gel for temporary relief of toothache and mouth ulcer pain.',
    'DESLIT 0.5 mg per ml 60 ml Syrup.webp': 'Desloratadine 0.5mg/ml syrup for allergic rhinitis and urticaria in children.',
    'DESOSTAR SYRUP 60 ml Syrup.webp': 'Desloratadine antihistamine syrup for allergy relief in children.',
    'Dextracin 5ml Eye Ear Drops.webp': 'Neomycin and dexamethasone combined eye and ear drops for bacterial infections with inflammation.',
    'DIAMICRON MR 60 mg 30 scored tablets.webp': 'Gliclazide 60mg modified-release tablets for blood sugar control in type 2 diabetes.',
    'Diane 35 2mg 0.035mg 21 tablets.webp': 'Cyproterone acetate 2mg / ethinylestradiol 0.035mg oral contraceptive pill, also used for acne and hirsutism.',
    'DIARIM 70 per_ v per v Surgical Spirit 100ml Liquid.webp': 'Surgical spirit (isopropyl alcohol 70%) for skin antisepsis before injections and wound care.',
    'DIARIM SURGICAL SPIRIT 70 per_ v per_ v 100ml Liquid.webp': 'Isopropyl alcohol 70% surgical spirit for skin disinfection and antiseptic use.',
    'DIARIM SURGICAL SPIRIT 70 per_ v per_ v 500ml Liquid.webp': 'Isopropyl alcohol 70% surgical spirit 500ml for skin antisepsis and surface disinfection.',
    'Diclo-Denk 100 Rectal 100mg 10 Suppositories.webp': 'Diclofenac 100mg rectal suppositories for pain and inflammation when oral administration is not possible.',
    'Diclogenta 5ml Eye Drops.webp': 'Diclofenac sodium ophthalmic drops for eye inflammation following surgery or injury.',
    'Diclomol SR 100 Tablets.webp': 'Diclofenac slow-release tablets for sustained relief of pain and inflammation in arthritis and musculoskeletal conditions.',
    'diproson 15g Cream.webp': 'Betamethasone dipropionate 0.05% cream for inflammatory skin conditions including eczema and psoriasis.',
    'Diracip-M 100ml Suspension.webp': 'Ciprofloxacin and metronidazole oral suspension for mixed bacterial and protozoal infections.',
    'DOLOACT-MR 100 Tablets.webp': 'Aceclofenac and muscle relaxant modified-release combination for musculoskeletal pain and spasm.',
    'Dopamac 250mg 100 Tablets.webp': 'Metoclopramide 250mg for gastroparesis; note: typically 10mg tablets - used as a prokinetic and antiemetic.',
    'Dulcolax 5mg 30 Coated Tablets.webp': 'Bisacodyl 5mg stimulant laxative for constipation and bowel preparation.',
    'Dupbalac 667g per l Oral Solution.webp': 'Lactulose oral solution for treatment of constipation and hepatic encephalopathy.',
    'Duphalac 667 g per_l Lactulose Oral Solution.webp': 'Lactulose 667g/L osmotic laxative solution for constipation and hepatic encephalopathy.',
    'Duphaston 10 mg 20 Film coated tablets.webp': 'Dydrogesterone 10mg progestogen tablets for menstrual disorders, endometriosis, and threatened miscarriage.',
})

DESCRIPTIONS.update({
    'Durex Close Fit 3 Condoms.webp': 'Durex Close Fit condoms for a snugger fit, providing reliable contraception.',
    'Durex Feels Regular Fit 3 Condoms.webp': 'Durex Feels ultra-thin regular fit condoms for contraception.',
    'Durex Fetherlite Regular Fit 3 Condoms.webp': 'Durex Fetherlite ultra-thin condoms for contraception and STI prevention.',
    'Durex Fetherlite Thin 3 Condoms.webp': 'Durex Fetherlite extra-thin condoms for natural feel and contraception.',
    'Durex Love Easy-On 3 Condoms.webp': 'Durex Easy-On condoms with a shaped design for easier application and contraception.',
    'Durex Pleasuremax With Ribs And Dots 3 Condoms.webp': 'Durex Pleasuremax condoms with ribs and dots for enhanced sensation and contraception.',
    'Durex Together Easy-On 3 Condoms.webp': 'Durex Together Easy-On condoms shaped for easy application and reliable contraception.',
    'Dynamogen Glutodine 3 mg Arginine aspartate 1 g 20 Drinkable ampoules Oral Solution.webp': 'Tonic supplement with amino acids and vitamins in drinkable ampoules for fatigue and recovery.',
    'DYNAPAR QPS Diclofenac Diethylamine and Absolute Alcohol 30ml Topical Solution.webp': 'Diclofenac topical solution for fast absorption and local pain relief in joints and muscles.',
    'DYRADE-M DS Diloxanide Furoate 500mg and Metronidazole 400mg 15 Tablets.webp': 'Diloxanide furoate and metronidazole combination for treatment of amoebiasis and intestinal protozoal infections.',
    'ECEE 2 Levonorgestrel 0.75mg 2 Tablets.webp': 'Levonorgestrel 0.75mg emergency contraceptive pill to be taken within 72 hours of unprotected sex.',
    'ECOFREE-120 Etoricoxib 120mg 10 Tablets.webp': 'Etoricoxib 120mg COX-2 inhibitor for acute pain and gout flares.',
    'ECOFREE-90 Etoricoxib 90mg 10 Tablets.webp': 'Etoricoxib 90mg for osteoarthritis, rheumatoid arthritis, and ankylosing spondylitis pain.',
    'ECOFREE PLUS Etoricoxib and Paracetamol 10 Tablets.webp': 'Etoricoxib and paracetamol combination for enhanced pain relief in musculoskeletal conditions.',
    'EFFERALGAN Paracétamol 1000mg 8 Tablets.webp': 'Paracetamol 1000mg effervescent tablets for fast-dissolving pain and fever relief in adults.',
    'EFFERALGAN Paracétamol 500mg 16 Tablets.webp': 'Paracetamol 500mg effervescent tablets for quick relief of pain and fever.',
    'EFLARON Métronidazole 200mg per 5ml 100ml Oral Suspension.webp': 'Metronidazole 200mg/5ml oral suspension for bacterial and protozoal infections in children.',
    'EFLARON Métronidazole 200mg per 5ml 60ml Oral Suspension.webp': 'Metronidazole 200mg/5ml oral suspension 60ml for anaerobic bacterial and protozoal infections.',
    'E-j Euro-Ject-II Single-Use Syringes 2ml without needle 100 Pieces.webp': 'Single-use 2ml syringes without needle for safe medication administration, box of 100.',
    'ELYMOX Amoxicillin 125 mg per 5 ml 100 ml Powder for reconstitution oral suspension.webp': 'Amoxicillin 125mg/5ml powder for oral suspension for bacterial infections in children.',
    'Emanzen Forte Serratiopeptidase 10 mg 30 Tablets.webp': 'Serratiopeptidase 10mg enzyme tablets for reducing inflammation, swelling, and pain.',
    'Emeton Metoclopramide 60 ml Oral Syrup.webp': 'Metoclopramide syrup for nausea, vomiting, and gastroparesis.',
    'Emitino Ondansetron 30 ml Oral Solution.webp': 'Ondansetron oral solution for prevention and treatment of nausea and vomiting in children.',
    'EMITOSS 4 Ondansetron Orally Disintegrating 10 Tablets.webp': 'Ondansetron 4mg orally disintegrating tablets for nausea and vomiting without water.',
    'EMITOSS 8 Ondansetron 10 Orally Disintegrating Tablets.webp': 'Ondansetron 8mg orally disintegrating tablets for chemotherapy-induced and post-operative nausea.',
    'EMITOSS Ondansetron 2mg per 5ml 30 ml Oral Solution.webp': 'Ondansetron 2mg/5ml oral solution for nausea and vomiting in children.',
    'Empiget Empagliflozin 10 mg 14 Tablets.webp': 'Empagliflozin 10mg SGLT2 inhibitor for blood sugar control in type 2 diabetes with cardiovascular benefit.',
    'Empiget Empagliflozin 25 mg 14 Tablets.webp': 'Empagliflozin 25mg SGLT2 inhibitor for improved blood sugar control and cardiovascular protection in type 2 diabetes.',
    'Enaril 5 Enalapril maleate 5 mg 100 tablets.webp': 'Enalapril maleate 5mg ACE inhibitor for hypertension and heart failure.',
    'ENAT 50g Cream.webp': 'Vitamin E cream for skin moisturisation and treatment of dry, rough, or damaged skin.',
    'Enervit Multivitamin Syrup Food Supplement 100ml Liquid.webp': 'Multivitamin syrup food supplement for daily nutritional support.',
    'Enhancin 1g 10 Tablets.webp': 'Amoxicillin 875mg/Clavulanate 125mg broad-spectrum antibiotic for moderate-to-severe bacterial infections.',
    'Enhancin 625mg 10 Tablets.webp': 'Amoxicillin 500mg/Clavulanate 125mg antibiotic for bacterial infections.',
    'ENO Calcium Antacid Mint Flavour 100 Tablets.webp': 'Calcium carbonate antacid chewable tablets for fast heartburn and indigestion relief.',
    'ENO Fruit Salt Lemon Flavour 48 x 4.5g Sachets Liquid.webp': 'ENO fruit salt effervescent sachets for fast relief from acidity, heartburn, and upset stomach.',
    'Entamaxin Oral Suspension 60ml Liquid.webp': 'Metronidazole and diloxanide furoate suspension for amoebic dysentery and intestinal protozoal infections.',
    'Entamaxin The Pan-amoebicide plus antispasmodic 30 Capsules.webp': 'Pan-amoebicide with antispasmodic capsules for amoebic infections with abdominal cramps.',
    'Enterogermina 2 billion per_ 5ml 10 vials of 5ml Oral Suspension.webp': 'Bacillus clausii probiotic suspension for restoring gut flora during and after antibiotic treatment.',
    'Enzoflam Paracetamol Diclofenac Sodium and Serratiopeptidase 30 Tablets.webp': 'Triple-action tablets with paracetamol, diclofenac, and serratiopeptidase for pain, inflammation, and swelling.',
    'Epiderm Cream Triple Action Skin Cream 15g Cream.webp': 'Triple-action skin cream combining a steroid, antifungal, and antibiotic for mixed skin infections.',
    'Epimax Baby & Junior Cetomacrogol & glycerine Fragrance, colourant & SLS free Hypoallergenic 400 g cream.webp': 'Hypoallergenic baby moisturising cream with cetomacrogol and glycerine, fragrance-free and SLS-free for sensitive skin.',
    'Erostin-20 Ebastine 20 mg 10 Tablets.webp': 'Ebastine 20mg antihistamine for relief of allergic rhinitis and urticaria.',
    'ESOFAG-D Esomeprazole 40mg and Domperidone 30mg 3 x 10 Capsules.webp': 'Esomeprazole 40mg and domperidone 30mg combination for GERD with gastroparesis.',
    'ESOFAG-KIT H. Pylori Kit 7 x 1 Kit.webp': 'H. pylori eradication kit containing PPI, clarithromycin, and amoxicillin for Helicobacter pylori infection.',
    'Esomac-20 Esomeprazole Magnesium 20 mg 28 Tablets.webp': 'Esomeprazole 20mg proton pump inhibitor for gastric acid reduction in GERD and peptic ulcer disease.',
    'Esome 40mg Esomeprazole Magnesium 14 Capsules.webp': 'Esomeprazole 40mg capsules for treatment of acid reflux, GERD, and peptic ulcers.',
    'ESOMOD-20 Esomeprazole 20mg 3x10 Tablets.webp': 'Esomeprazole 20mg tablets for reducing gastric acid secretion.',
    'ESOMOD-40 Esomeprazole 40mg 3x10 Tablets.webp': 'Esomeprazole 40mg tablets for GERD, peptic ulcers, and acid reflux.',
    'Etorix 60 Etoricoxib 60mg 40 Film Coated Tablets.webp': 'Etoricoxib 60mg for osteoarthritis and musculoskeletal pain management.',
    'Etorix 90 Etoricoxib 90mg 30 Film Coated Tablets.webp': 'Etoricoxib 90mg for rheumatoid arthritis and ankylosing spondylitis.',
    'ETOXYM S-Etodolac 300mg + Paracetamol 500mg 10 Tablets.webp': 'Etodolac 300mg NSAID and paracetamol 500mg combination for pain and inflammation.',
    'Euthyrox 100 ug 30 Tablets.webp': 'Levothyroxine 100mcg tablets for treatment of hypothyroidism and thyroid hormone replacement.',
    'Evit 400 Vitamin E 400 mg 30 Capsules.webp': 'Vitamin E 400IU soft gelatin capsules for antioxidant protection and skin health.',
    'Evit 400 Vitamin E 400 mg Extra Strength 30 capsules.webp': 'Vitamin E 400IU extra strength capsules for antioxidant support.',
    'EXEVATE-MF Ointment.webp': 'Fluticasone and miconazole combination ointment for inflammatory skin conditions with fungal infection.',
    'EXEVATE-MF 20g Ointment.webp': 'Fluticasone and miconazole combination ointment 20g for inflammatory fungal skin conditions.',
})

DESCRIPTIONS.update({
    'FAHOLO Aqueous Cream.webp': 'Aqueous cream for moisturising dry skin and as a soap substitute for sensitive skin.',
    'FAHOLO Liquid Paraffin.webp': 'Liquid paraffin emollient for dry skin conditions and as a laxative when taken orally.',
    'FAHOLO Surgical Spirit 70 per_ v per_ v 100ml Liquid.webp': 'Surgical spirit 70% for skin antisepsis before injections and minor wound care.',
    'FASTUM gel ketoprofen 2.5 per_ 20g.webp': 'Ketoprofen 2.5% topical gel for local relief of pain and inflammation in muscles and joints.',
    'Febo-G 80mg 20 Tablets.webp': 'Febuxostat 80mg xanthine oxidase inhibitor for prevention of gout flares by lowering uric acid levels.',
    'femiflora 7B CFU 30 Veggie Capsules.webp': "Probiotic capsules with 7 billion CFU strains to support women's vaginal and digestive flora.",
    'FENPLUS 120mg plus 100mg per 5mL 100ml Oral Suspension.webp': 'Ibuprofen and paracetamol combination suspension for paediatric pain and fever.',
    'FENPLUS 400mg + 325mg Ibuprofen and Paracetamol 30 Tablets.webp': 'Ibuprofen 400mg and paracetamol 325mg combination tablets for moderate pain and fever.',
    'FERROLIC-LF Ferrous Sulphate and Folic Acid 10 x 10 Tablets.webp': 'Ferrous sulphate and folic acid tablets for prevention and treatment of iron-deficiency anaemia.',
    'Fevapyn Extra Paracetamol and Ibuprofen 100 ml Suspension.webp': 'Paracetamol and ibuprofen combination suspension for fever and pain in children.',
    'Fexet 180mg Fexofenadine HCl 20 Tablets.webp': 'Fexofenadine 180mg non-sedating antihistamine for seasonal allergic rhinitis and urticaria.',
    'FINEMOX CV 1000 Co-Amoxiclav 1 x 10 Tablets.webp': 'Co-amoxiclav 1000mg (amoxicillin/clavulanate) antibiotic for severe bacterial infections.',
    'FINEMOX CV 625 Co-Amoxiclav 1 x 10 Tablets.webp': 'Co-amoxiclav 625mg antibiotic tablets for respiratory, urinary, and skin infections.',
    'FIXEM 50mg per 5ml 60 ml Powder for Oral Suspension.webp': 'Cefixime 50mg/5ml oral suspension for bacterial infections including ear, throat, and urinary infections in children.',
    'Flonaspray 50 µg per spray Fluticasone Propionate 120 Sprays Nasal Spray.webp': 'Fluticasone propionate 50mcg nasal spray for prevention and treatment of allergic rhinitis.',
    'Floral 0.1 per_ w per v Fluorometholone 5ml Sterile Ophthalmic Suspension.webp': 'Fluorometholone 0.1% ophthalmic suspension for inflammatory conditions of the eye.',
    'FLU - GONE Decongestant 10 Capsules.webp': 'Decongestant capsules for relief of nasal congestion and sinus pressure due to colds and flu.',
    'FLU-GONE DM Cough Syrup 60ml Syrup.webp': 'Dextromethorphan-containing cough syrup for dry, irritating coughs associated with cold and flu.',
    'FLU-GONE EX EXPECTORANT Cough Syrup 60ml Syrup.webp': 'Expectorant cough syrup for productive coughs with chest congestion.',
    'FLU-GONE-P+ PLUS FOR CHILDREN 60ml Syrup.webp': 'Paediatric cold and cough syrup for relief of fever, congestion, and cough in children.',
    'FLUSORT 50mcg 120 metered doses Nasal Spray.webp': 'Fluticasone 50mcg nasal spray for allergic and non-allergic rhinitis.',
    'Folisure 5mg 100 Tablets.webp': 'Folic acid 5mg tablets for folate deficiency, megaloblastic anaemia, and pre-conception supplementation.',
    'foralin inhaler 200 120 metered doses Inhaler.webp': 'Formoterol 12mcg long-acting bronchodilator inhaler for maintenance treatment of asthma and COPD.',
    'Funbact-A 30g Cream.webp': 'Combination cream with antifungal, antibiotic, and corticosteroid agents for mixed skin infections with inflammation.',
    'FUNGISTAT 2 per_ w per_ w 15g Cream.webp': 'Miconazole nitrate 2% antifungal cream for athlete''s foot, ringworm, and other fungal skin infections.',
    'Furosemide 40mg 100 Tablets.webp': 'Furosemide 40mg loop diuretic for oedema associated with heart failure, liver cirrhosis, and kidney disease.',
    'Futcare Corn Caps 5 Medicated Plasters.webp': 'Salicylic acid medicated plasters for painless removal of corns on the feet.',
    "Galaxy's Lysodol-MR 30 Tablets.webp": 'Aceclofenac and muscle relaxant modified-release tablets for musculoskeletal pain and stiffness.',
    'Gastro Gel 100 ml Oral Suspension.webp': 'Antacid and alginate oral suspension for heartburn, acid reflux, and gastric discomfort.',
    'Gastro Gel 200 ml Oral Suspension.webp': 'Antacid oral suspension 200ml for relief of acid-related symptoms.',
    'GASTRO PLUS Esomeprazole Magnesium 40mg and Itopride Hydrochloride 150mg 10 Capsules.webp': 'Esomeprazole 40mg and itopride 150mg combination for GERD and gastroparesis.',
    'Gaviscon Double Action 150ml Liquid.webp': 'Gaviscon antacid and alginate liquid that forms a barrier to prevent acid reflux.',
    'Gesic ADL 400 mg 100 Tablets.webp': 'Ibuprofen 400mg tablets for pain, inflammation, and fever.',
    'Gifol THEOPHYLLINE AND EPHEDRINE HCl 10 X 10 Tablets.webp': 'Theophylline and ephedrine combination bronchodilator tablets for asthma and COPD.',
    'GINSOMIN 30 Softgel Capsules.webp': 'Ginseng and multivitamin softgel capsules for energy, mental alertness, and general wellbeing.',
    'GIT-PLUS Rabeprazole Sodium and Itopride Hydrochloride SR 1 X 10 Capsules.webp': 'Rabeprazole 20mg PPI and itopride prokinetic combination for acid reflux with delayed gastric emptying.',
    'GLENCEE Vitamin C 1000 mg 20 Effervescent Tablets.webp': 'Vitamin C 1000mg effervescent tablets for immune support and antioxidant protection.',
    'Glucomet 500mg 56 Tablets.webp': 'Metformin 500mg tablets for blood sugar control in type 2 diabetes.',
    'Glucophage 1000mg 60 Film-Coated Tablets.webp': 'Metformin 1000mg tablets for management of type 2 diabetes mellitus.',
    'Glucophage 850mg 60 Film-Coated Tablets.webp': 'Metformin 850mg film-coated tablets for type 2 diabetes blood sugar control.',
    'GLYKOF Cough Syrup 120ml Liquid.webp': 'Cough syrup for soothing relief of dry and productive coughs.',
    'Glyso Infant Glycerin 1g 12 Suppositories.webp': 'Glycerine suppositories 1g for relief of constipation in infants.',
    'GOFEN 200 Clearcap Fast Acting 6 x 10 Softgel Capsules.webp': 'Ibuprofen 200mg fast-acting softgel capsules for rapid pain and fever relief.',
    'GOFEN 400 Clearcap Fast Acting 6 x 10 Softgel Capsules.webp': 'Ibuprofen 400mg fast-acting softgel capsules for effective pain and inflammation relief.',
    'GOOD MORNING LUNG TONIC Coughs and Bronchitis Syrup 100ml Liquid.webp': 'Herbal lung tonic syrup for coughs, bronchitis, and respiratory complaints.',
    'GRABACIN Neomycin Bacitracin Gramicidin 10gm Antibiotic Dusting Powder.webp': 'Neomycin, bacitracin, and gramicidin antibiotic dusting powder for prevention of infection in wounds and ulcers.',
    'Gripe Water 100ml Liquid.webp': 'Traditional gripe water for soothing infant colic, wind, and digestive discomfort.',
    'Grisozen 125 Griseofulvin 125mg 10 x 10 Tablets.webp': 'Griseofulvin 125mg antifungal tablets for ringworm, athlete''s foot, and nail fungal infections.',
    'Herbigor HTC Honey and Lemon 100ml Liquid.webp': 'Herbal cough remedy with honey and lemon for soothing coughs and sore throat.',
    'Histargan Promethazine 100ml Syrup.webp': 'Promethazine antihistamine syrup for allergy relief, cough, and sedation in children.',
    'HIV 1+2 One Step Anti-HIV 1+2 Test Cassette 1 Test.webp': 'Rapid HIV 1 and 2 antibody test cassette for early detection of HIV infection.',
    'Homagon 100ml Syrup.webp': 'Appetite stimulant and tonic syrup for underweight children and adults.',
    'Homagon 10 Capsules.webp': 'Appetite stimulant capsules for improving appetite and weight gain.',
    'Hydrochlorothiazide 50mg 100 Tablets.webp': 'Hydrochlorothiazide 50mg thiazide diuretic for hypertension and oedema.',
    'Ibugesic Ibuprofen-Paracetamol 60ml Suspension.webp': 'Ibuprofen and paracetamol combination suspension for fever and pain in children.',
    'IFAS Ferrous Sulphate 200mg and Folic Acid 400mcg 30 Tablets.webp': 'Iron and folic acid tablets for prevention and treatment of iron-deficiency anaemia and neural tube defect prevention in pregnancy.',
    'IMPACT Tincture of Iodine Iodine 2 per_ Potassium Iodide 2.4 per_ 100ml Liquid.webp': 'Iodine tincture for skin antisepsis and wound disinfection.',
    'IMPACT Tincture of Iodine Iodine 2 per_ Potassium Iodide 2.4 per_ 50ml Liquid.webp': 'Iodine tincture 50ml for skin antisepsis and minor wound disinfection.',
    'INTAMINE 25gm Cream.webp': 'Tolnaftate antifungal cream for athlete''s foot, ringworm, and tinea infections.',
})

DESCRIPTIONS.update({
    'IVADIN 5 Ivabradine 5 mg 10 Tablets.webp': 'Ivabradine 5mg for reduction of heart rate in chronic heart failure and symptomatic stable angina.',
    'just zinc Zinc Sulphate 20 mg 100 Tablets.webp': 'Zinc sulphate 20mg tablets for zinc deficiency, immune support, and adjunct treatment of diarrhoea.',
    'KALUMA Plus King 50 x 2 Lozenges.webp': 'Throat lozenges for soothing sore throat and mouth irritation.',
    'KALUMA Strong Paracetamol 200mg Aspirin 400mg Caffeine 50mg 100 Caplets.webp': 'Combination analgesic with paracetamol, aspirin, and caffeine for effective pain relief.',
    'Kemoxyl Amoxicillin 100ml Dry Suspension.webp': 'Amoxicillin dry suspension 100ml for bacterial infections in children.',
    'Kemoxyl Amoxicillin 60ml Dry Suspension.webp': 'Amoxicillin dry suspension 60ml for bacterial infections in children.',
    'KETESSE 25 mg 20 film-coated tablets.webp': 'Dexketoprofen 25mg NSAID for short-term treatment of mild to moderate pain.',
    'KETOLAC 0.5 per_ w per v Sterile 5 mL Ophthalmic Solution.webp': 'Ketorolac 0.5% ophthalmic solution for post-operative eye inflammation and allergic conjunctivitis.',
    'Keto Plus 120 ml Shampoo.webp': 'Ketoconazole 2% medicated shampoo for dandruff, seborrhoeic dermatitis, and scalp fungal infections.',
    'kiss Chocolate Premium lubricated condoms Contains 3s x 24 packs.webp': 'Chocolate-flavoured premium lubricated condoms for contraception.',
    'KISS Strawberry Premium lubricated condoms Contains 3s x 24 packs Condoms.webp': 'Strawberry-flavoured premium lubricated condoms for contraception.',
    "kiss Studded Premium Lubricated Condoms Contains 3's x 24 packs Pack.webp": 'Studded premium lubricated condoms for enhanced sensation and contraception.',
    'KleanGut + 200 ml Oral Emulsion.webp': 'Gut-cleansing oral emulsion with prebiotics and probiotics for digestive health.',
    'KLY 42 g Lubricating Jelly.webp': 'Water-based lubricating jelly for personal use and medical procedures.',
    'LACTITOSS 100 ml Oral Solution.webp': 'Lactulose oral solution for constipation and hepatic encephalopathy.',
    'Lanzol DT Junior Lansoprazole 15mg 10 Tablets.webp': 'Lansoprazole 15mg dispersible tablets for acid-related disorders in children.',
    'LETZGO - MR 60mg and 4mg 30 Tablets.webp': 'Fexofenadine 60mg and pseudoephedrine 4mg modified-release tablets for allergy with congestion.',
    'Levobact-500 500 mg 10 Tablets.webp': 'Levofloxacin 500mg fluoroquinolone antibiotic for respiratory, urinary, and skin infections.',
    'Levobact-750 750 mg 10 Tablets.webp': 'Levofloxacin 750mg for severe respiratory infections and complicated urinary tract infections.',
    'Levolukast Kid 3 x 10 Tablets.webp': 'Montelukast and levocetirizine combination tablets for allergic rhinitis in children.',
    'Livoluk 100 ml Liquid.webp': 'Lactulose oral solution for constipation and promoting regular bowel movements.',
    'L Montus Kid 10 Tablets.webp': 'Montelukast and levocetirizine paediatric tablets for allergic rhinitis and asthma.',
    'Lobak 10 Tablets.webp': 'Paracetamol and chlorzoxazone muscle relaxant combination for back pain and muscle spasm.',
    'Lorhistina 10 mg 30 Tablets.webp': 'Loratadine 10mg non-sedating antihistamine for hay fever and allergic rhinitis.',
    'Lorhistina Syrup 5mg per 5mL Oral solution.webp': 'Loratadine 5mg/5ml oral solution for allergy symptoms in children.',
    'Lubtear 10 ml Drops.webp': 'Artificial tear eye drops for dry eye relief and lubrication.',
    'LysoFlam 30g Gel.webp': 'Diclofenac topical gel for localised pain and inflammation relief.',
    'LysoFlam 30 Tablets.webp': 'Aceclofenac anti-inflammatory tablets for pain and inflammation.',
    'Maalox 20 Sachets-doses Liquid.webp': 'Aluminium and magnesium hydroxide antacid sachets for heartburn and indigestion.',
    'MAGNACID GEL 100ml Magaldrate and Simethicone Oral Suspension.webp': 'Magaldrate and simethicone antacid suspension for heartburn, acid indigestion, and bloating.',
    'MAXITROL 3.5g Sterile Ophthalmic Ointment.webp': 'Neomycin, polymyxin B, and dexamethasone ophthalmic ointment for bacterial eye infections with inflammation.',
    'MAXITROL 5ml Sterile Ophthalmic Suspension.webp': 'Neomycin, polymyxin B, and dexamethasone eye drops for bacterial conjunctivitis with inflammation.',
    'MEDICLOAMP 100ml Powder for reconstitution oral suspension.webp': 'Amoxicillin/cloxacillin antibiotic suspension for bacterial infections in children.',
    'Medi-Keel A 16 Lozenges.webp': 'Antiseptic throat lozenges for relief of sore throat and mouth infections.',
    'MEDIVEN 15gm Cream.webp': 'Miconazole antifungal cream for ringworm, athlete''s foot, and fungal skin infections.',
    'MEDIVEN 15gm Ointment.webp': 'Miconazole antifungal ointment for fungal skin infections.',
    'MEFTAL-500 500mg 10 Tablets.webp': 'Mefenamic acid 500mg NSAID for dysmenorrhoea, dental pain, and mild to moderate pain.',
    'MEFTAL-SPAS 10 Tablets.webp': 'Mefenamic acid and dicyclomine combination for period pain with cramping.',
    'Metcos 10mg 100 Tablets.webp': 'Metoclopramide 10mg for nausea, vomiting, and delayed gastric emptying.',
    'MOMATE 15gm Cream.webp': 'Mometasone furoate 0.1% topical steroid cream for eczema, psoriasis, and inflammatory skin conditions.',
    'Montebasto 1 x 10 Tablets.webp': 'Montelukast and levocetirizine combination for allergic rhinitis and asthma.',
    'MONTECOR PLUS Montelukast and Levocetirizine Dihydrochloride 1 x 10 Tablets.webp': 'Montelukast and levocetirizine combination for allergic rhinitis and related asthma symptoms.',
    'MONTERU Montelukast 10mg + Rupatadine 10mg 1 x 10 Tablets.webp': 'Montelukast and rupatadine combination for allergic rhinitis with asthma component.',
    'MONTIGET Montelukast Sodium 4 mg 14 Sachets Pediatric Granules.webp': 'Montelukast 4mg granule sachets for seasonal allergic rhinitis and asthma in young children.',
    'MTM-50 Sildenafil Citrate 4 Tablets.webp': 'Sildenafil citrate 50mg tablets for erectile dysfunction.',
    'MYOSPAZ Chlorzoxazone and Paracetamol 100 Tablets Muscle Relaxant Analgesic.webp': 'Chlorzoxazone muscle relaxant and paracetamol combination for musculoskeletal pain and spasm.',
    'Nat B B Complex 3 x 10 Softgel Capsules.webp': 'Vitamin B-complex softgel capsules for nervous system support and energy metabolism.',
    'NAT B High Potency B Vitamins Formula 30 Softgel Capsules.webp': 'High-potency B vitamin complex for energy production, nervous system function, and metabolism.',
    'NATOA Mebendazole 30ml Suspension Broad Spectrum Anthelmintic.webp': 'Mebendazole suspension for broad-spectrum treatment of intestinal worm infections including threadworm and roundworm.',
    'Nebilong-AM Nebivolol 5 mg and Amlodipine 5 mg 30 Tablets.webp': 'Nebivolol 5mg and amlodipine 5mg combination for hypertension.',
    'NEOPEPTINE-RB Carminative Mixture 15ml Drops.webp': 'Carminative drops for infant colic, wind, and abdominal discomfort.',
    'Nescopharm Africa Ltd Syringes Without Needle 5ml Luer Slip 100 Pcs Box.webp': '5ml single-use syringes without needle, luer slip, box of 100.',
    'Netazox 500mg Nitazoxanide 6 Tablets.webp': 'Nitazoxanide 500mg for diarrhoea caused by Cryptosporidium and Giardia.',
    'Nexium 10mg Esomeprazolo Granulato Gastroresistente 28 Bustine Per Sospensione Orale.webp': 'Esomeprazole 10mg granules for oral suspension for GERD in children.',
    'Nexium 40mg esomeprazole 14 Tablets.webp': 'Esomeprazole 40mg proton pump inhibitor for severe GERD and peptic ulcer disease.',
    'Nifedi-Denk 20 Retard Nifedipine 20mg 100 Prolonged-Release Tablets.webp': 'Nifedipine 20mg prolonged-release tablets for hypertension and angina.',
    'Nilacid Sugar Free 100ml Suspension.webp': 'Sugar-free antacid suspension for heartburn and acid indigestion in diabetic patients.',
    'Nogluc Glibenclamide 5mg 112 Tablets.webp': 'Glibenclamide 5mg sulfonylurea for lowering blood sugar in type 2 diabetes.',
    'NORASH Cream 20g.webp': 'Antifungal cream for nappy rash and skin fold infections caused by Candida.',
    'Nosfree Saline Normal Saline 15 ml Nasal Drops.webp': 'Isotonic saline nasal drops for nasal congestion and moisturising dry nasal passages.',
    'NOSIC Doxylamine Succinate and Pyridoxine Hydrochloride 2 X 10 TABLETS.webp': 'Doxylamine and pyridoxine combination for nausea and vomiting in pregnancy.',
    'NYSTAL Oral Suspension Nystatin U.S.P 100,000 I.U per ml READY MIXED 30ml.webp': 'Nystatin 100,000 IU/ml oral suspension for oral thrush (candidiasis) in adults and children.',
    'Ocid Omeprazole 20 mg 10 x 10 Capsules.webp': 'Omeprazole 20mg proton pump inhibitor for peptic ulcers, GERD, and Zollinger-Ellison syndrome.',
    'OCULAST Azelastine Hydrochloride 0.05 per_ 5 ml Sterile Eye Drops.webp': 'Azelastine 0.05% antihistamine eye drops for allergic conjunctivitis.',
    'Ojen-OZ 10 Tablets Ofloxacin and Ornidazole Tablets.webp': 'Ofloxacin and ornidazole combination for mixed bacterial and protozoal infections.',
    'OLOPAT Olopatadine Hydrochloride Ophthalmic Solution USP 0.1 per_ w per v 5 ml EYE DROPS.webp': 'Olopatadine 0.1% antihistamine eye drops for allergic conjunctivitis.',
    'Omis Gel 200 ml Antacid Antiflatulent Oral Suspension.webp': 'Antacid and antiflatulent suspension for relief of heartburn, bloating, and excess gas.',
    'On Call Plus Blood Glucose Test Strips 50 Count.webp': 'Blood glucose test strips compatible with On Call Plus glucometer for blood sugar monitoring.',
    'Osteocerin Glucosamine MSM and Diacerein 1 x 10 Tablets.webp': 'Joint supplement with glucosamine, MSM, and diacerein for osteoarthritis and joint pain.',
    'Otorex Anti-Bacterial Anti-Fungal 10 ml Ear Drops.webp': 'Antibacterial and antifungal ear drops for treatment of otitis externa.',
    'Otrivin Children Xylometazoline Hydrochloride 0.05per_ 10 ml Nasal Drops.webp': 'Xylometazoline 0.05% nasal drops for nasal decongestion in children.',
    'P-ALAXIN Dihydroartemisinin 40 mg + Piperaquine Phosphate 320 mg 9 Tablets.webp': 'Dihydroartemisinin/piperaquine antimalarial tablets for treatment of uncomplicated malaria.',
    'Panadol Advance Pain & Fever 100 Tablets.webp': 'Paracetamol 500mg tablets for pain and fever relief.',
    'Panadol Cold & Flu Night Time Relief 24 Tablets.webp': 'Paracetamol, diphenhydramine, and decongestant tablets for cold and flu symptoms at night.',
    'Panadol Extra Strong Pain Relief 100 Tablets.webp': 'Paracetamol 500mg and caffeine combination for enhanced pain relief.',
    'Pantocid 40 40 mg Tablets.webp': 'Pantoprazole 40mg proton pump inhibitor for GERD, peptic ulcers, and acid-related conditions.',
    'PARAFAST ET 1000 Soluble Paracetamol 1000 mg 8 Effervescent Tablets.webp': 'Paracetamol 1000mg effervescent soluble tablets for fast-acting pain and fever relief.',
    'PARAFAST ET 500 Soluble Paracetamol 500 mg 16 Effervescent Tablets.webp': 'Paracetamol 500mg effervescent tablets for quick dissolution and relief of pain and fever.',
    'PAROL 250 mg Paracetamol per_ 5 ml 100 ml Oral Suspension.webp': 'Paracetamol 250mg/5ml oral suspension for pain and fever in older children.',
    'Peardine Mouthwash & Gargle 100ml Liquid.webp': 'Antiseptic mouthwash and gargle for oral hygiene, fresh breath, and minor mouth infections.',
    'Pepsol Digestive Enzymes with Simethicone 30 Capsules.webp': 'Digestive enzyme capsules with simethicone for bloating, flatulence, and indigestion.',
    'Pernex AC 5 per_ Benzoyl Peroxide Gel 20g.webp': 'Benzoyl peroxide 5% gel for topical treatment of acne vulgaris.',
    'PIRICLOR Chlorpheniramine Maleate Syrup 100 ML.webp': 'Chlorpheniramine maleate antihistamine syrup for allergy relief and cold symptoms.',
    'Piriton syrup Chlorpheniramine Maleate BP 100ml syrup.webp': 'Piriton chlorpheniramine 2mg/5ml antihistamine syrup for hay fever, urticaria, and allergic reactions.',
    'Ponstan Forte 500 mg Mefenamic Acid BP 50 film coated tablets Tablets.webp': 'Mefenamic acid 500mg film-coated tablets for dysmenorrhoea, dental pain, and moderate pain.',
    'POSTINOR-2 levonorgestrel 2 tabl. comp.webp': 'Levonorgestrel 0.75mg x 2 emergency contraceptive pills to be taken within 72 hours of unprotected intercourse.',
    'Powergesic MR Diclofenac Paracetamol and Chlorzoxazone Tablets 10 Tablets.webp': 'Diclofenac, paracetamol, and chlorzoxazone combination for musculoskeletal pain and spasm.',
    'Prednisolone Prednisolone 5mg 100 Tablets.webp': 'Prednisolone 5mg corticosteroid for inflammatory and autoimmune conditions including asthma, arthritis, and skin disorders.',
    'Presartan H 50 2x14 Tablets.webp': 'Losartan 50mg and hydrochlorothiazide combination for hypertension.',
    'Primolut N 5 mg 2x15 tabs.webp': 'Norethisterone 5mg for menstrual disorders, endometriosis, and delaying periods.',
    'Probeta-N Betamethasone Sodium Phosphate BP 0.1per_ w per v + Neomycin Sulphate BP 0.5per_ w per v 7.5ml Drops.webp': 'Betamethasone and neomycin combined ear/eye drops for inflammatory bacterial infections.',
    'PROFEN-200 Ibuprofen 200mg 10 X 10 Tablets.webp': 'Ibuprofen 200mg tablets for mild to moderate pain, fever, and inflammation.',
    'Propranolol 40mg 100 Tablets.webp': 'Propranolol 40mg beta-blocker for hypertension, angina, anxiety, and migraine prevention.',
    'Protas 20 30 Tablets.webp': 'Pantoprazole 20mg proton pump inhibitor for acid-related gastrointestinal disorders.',
    'Protas 40 30 Tablets.webp': 'Pantoprazole 40mg for GERD, peptic ulcers, and Zollinger-Ellison syndrome.',
    'PROTO MASK 3 Ply 50 PCS Disposable Protective Face Mask.webp': 'Disposable 3-ply protective face masks, box of 50, for personal protection.',
    'pureCal Chewable Tablets of Milk Calcium 30 Tablets.webp': 'Milk calcium chewable tablets for bone health and calcium supplementation.',
    'Quadrajel Antiseptic Analgesic Astringent & Demulcent 15g Gel.webp': 'Antiseptic dental gel with analgesic, astringent, and soothing properties for oral ulcers and gum pain.',
    'Ranferon-12 Fer Avec Vitamine B12 Et Acide Folique 200ml Liquid.webp': 'Iron, vitamin B12, and folic acid tonic for anaemia, fatigue, and nutritional deficiency.',
    'Remidin 100 ml Mouthwash.webp': 'Antiseptic mouthwash for daily oral hygiene and prevention of gum disease.',
    'RILIF MR Aceclofenac Paracetamol and Chlorzoxazone 2 X 10 Tablets.webp': 'Aceclofenac, paracetamol, and chlorzoxazone modified-release combination for musculoskeletal pain.',
    'Rinacet Cetirizine Hydrochloride 60ml Sirop.webp': 'Cetirizine syrup 60ml for allergy relief in children.',
    'Risek Insta Omeprazole + Sodium Bicarbonate 20mg 10 Sachets Powder for oral suspension.webp': 'Omeprazole 20mg and sodium bicarbonate sachets for rapid onset acid suppression.',
    'Rufenac Diclofenac 20g Gel.webp': 'Diclofenac sodium 1% gel for topical anti-inflammatory and analgesic relief.',
    'RUPATINE 10 MG_ Rupatadine Tablets 1 x 10 Tablets.webp': 'Rupatadine 10mg antihistamine for allergic rhinitis and chronic urticaria.',
})

DESCRIPTIONS.update({
    'SAFERON Sirop Syrup 150ml Liquid.webp': 'Iron and vitamin tonic syrup for iron deficiency anaemia and nutritional support.',
    'SARACAL Calcium Citrate Magnesium Zinc and Vitamin D3 2x15 Tablets.webp': 'Calcium, magnesium, zinc, and vitamin D3 combination supplement for bone health.',
    'SARA-D3 Vitamin D3 Oral Drops 15ml Drops.webp': 'Vitamin D3 oral drops for prevention and treatment of vitamin D deficiency.',
    "SCOTT'S Emulsion Original Cod Liver Oil Food Supplement 100ml Liquid.webp": "Scott's Emulsion cod liver oil with vitamins A and D for immune support and bone health.",
    'Serrazen Plus Aceclofenac and Serratiopeptidase 1x10 Tablets.webp': 'Aceclofenac and serratiopeptidase combination for pain relief and reduction of post-injury swelling.',
    'Seven Seas Cod Liver Oil One-A-Day 60 Capsules.webp': 'Seven Seas cod liver oil capsules with omega-3 fatty acids, vitamin A and D for joint and immune health.',
    'SEVEN SEAS Cod Liver Oil Plus Omega 3 Fish Oil Food Supplement 100ml Liquid.webp': 'Cod liver oil and omega-3 supplement for heart, joint, and brain health.',
    'Shalcip TZ Ciprofloxacin 500mg and Tinidazole 600mg 10 Tablets.webp': 'Ciprofloxacin and tinidazole combination for gastrointestinal infections, traveller''s diarrhoea, and pelvic inflammatory disease.',
    'Shaltoux Herbal Cough Syrup 100ml Liquid.webp': 'Herbal cough syrup for soothing dry and productive coughs.',
    'SONADERM-GM Clobetasol Propionate Miconazole Nitrate and Gentamicin Sulphate 10g Cream.webp': 'Triple combination cream with clobetasol (potent steroid), miconazole (antifungal), and gentamicin (antibiotic).',
    'SONATEC Mouthwash Menthol Fresh Alcohol Free 250ml Liquid.webp': 'Alcohol-free antiseptic mouthwash with menthol for fresh breath and oral hygiene.',
    'Spasmomen Otilonium Bromide 40mg 30 Tablets.webp': 'Otilonium bromide 40mg antispasmodic for irritable bowel syndrome and abdominal cramps.',
    'SPASMOPRIV Fenoverine 100mg Tablets.webp': 'Fenoverine 100mg antispasmodic for abdominal spasms and smooth muscle pain.',
    'Stugeron Cinnarizine 25mg 50 Tablets.webp': 'Cinnarizine 25mg antihistamine for motion sickness, vertigo, and nausea.',
    'Sucrafil O Gel Sucralfate and Oxetacaine Suspension 100ml Liquid.webp': 'Sucralfate and oxetacaine suspension for peptic ulcer pain relief and mucosal protection.',
    'Susten 400 Progesterone Soft Gelatin Capsules 400mg.webp': 'Progesterone 400mg soft gelatin capsules for luteal phase support and threatened miscarriage.',
    'TACROVATE FORTE Tacrolimus Ointment 0.1% w_w 10g Ointment.webp': 'Tacrolimus 0.1% ointment for moderate-to-severe atopic dermatitis (eczema) in patients unresponsive to other treatments.',
    'Talgentis-20 Tadalafil Tablets USP 20mg 4 Tablets.webp': 'Tadalafil 20mg PDE5 inhibitor for erectile dysfunction.',
    'Terbibact Mixi Cream 15g Cream.webp': 'Terbinafine with antibacterial and anti-inflammatory agents for mixed fungal and bacterial skin infections.',
    'TEXAMOL Paracetamol Tablets BP 500mg Tablets.webp': 'Paracetamol 500mg tablets for relief of mild to moderate pain and fever.',
    'THIOCARB PROM Carbocisteine with Promethazine Irritative Cough Adult & Children Syrup Honey Based 100ml.webp': 'Carbocisteine mucolytic and promethazine antihistamine combination syrup for coughs with mucus.',
    'THIORELAX Thiocolchicoside 8mg Aceclofenac 100mg & Paracetamol 500mg 30 Tablets.webp': 'Thiocolchicoside muscle relaxant with aceclofenac and paracetamol for musculoskeletal pain and spasm.',
    'THIOZONE Paracetamol and Thiocolchicoside 10 Tablets.webp': 'Paracetamol and thiocolchicoside muscle relaxant combination for pain and muscle spasm.',
    'TOUFCOF Paediatric For Tough Cough & Cold In Children 100ml.webp': 'Paediatric cough and cold syrup for relief of congestion, cough, and cold symptoms in children.',
    'TRACY Tetracycline Hydrochloride Ophthalmic Ointment USP 1 per_ w per_w 3.5gm.webp': 'Tetracycline 1% ophthalmic ointment for bacterial conjunctivitis and trachoma.',
    'TRES-ORIX FORTE Solución oral 100ml.webp': 'Appetite stimulant oral solution with vitamins and minerals for improving appetite and weight gain.',
    'TREVIAMET 50mg+1000mg Sitagliptin + Metformin HCl 35 Tablets.webp': 'Sitagliptin 50mg and metformin 1000mg combination for improved blood sugar control in type 2 diabetes.',
    'TRICOHIST Expectorant Oral Syrup For Coughs & Colds 60ml.webp': 'Antihistamine and expectorant cough syrup for productive coughs and cold symptoms.',
    'TRICOZOLE-200 Metronidazole Tablets 200mg 100 Tablets.webp': 'Metronidazole 200mg tablets for anaerobic bacterial infections and protozoal infections.',
    'TRICOZOLE-400 Metronidazole Tablets 400mg 100 Tablets.webp': 'Metronidazole 400mg tablets for treatment of anaerobic infections, giardiasis, and amoebiasis.',
    'Tridex 60ml Cough Mixture Liquid.webp': 'Cough mixture for soothing dry and productive coughs.',
    'Trimetabol Oral Solution 150ml Liquid.webp': 'Appetite stimulant oral solution with lysine, vitamins, and minerals for improving appetite in children.',
    'TRUST Ribbed 24 Quality 3 Pack Condoms.webp': 'Trust ribbed condoms for enhanced sensation and reliable contraception.',
    'TUSPEL PLUS Mucolytic-Bronchodilator Expectorant 100ml Syrup.webp': 'Mucolytic and bronchodilator expectorant syrup for productive coughs with bronchospasm.',
    'ULGICID Cherry Flavour 200ml Suspension.webp': 'Cherry-flavoured antacid suspension for heartburn and acid indigestion.',
    'ULGICID Mint Flavour 200ml Suspension.webp': 'Mint-flavoured antacid suspension for relief of acid-related symptoms.',
    'ULGICID Pineapple Flavour 200ml Suspension.webp': 'Pineapple-flavoured antacid suspension for heartburn and indigestion.',
    'Univir Acyclovir 5 per_ w per_ w per_w 10gm Cream.webp': 'Acyclovir 5% cream for topical treatment of cold sores (herpes labialis) and genital herpes.',
    'Varinil Amlodipine Besylate 5mg 28 Tablets.webp': 'Amlodipine 5mg calcium channel blocker for hypertension and stable angina.',
    'VELVEX Absorbent Cotton Wool Cotton Wool.webp': 'Absorbent cotton wool for wound care, cleaning, and applying topical preparations.',
    'VELVEX Super Absorbent Cotton Wool 200 GRMS Cotton Wool.webp': 'Velvex super absorbent cotton wool 200g for wound care and first aid.',
    'VELVEX Super Absorbent Cotton Wool 400 GRMS Cotton Wool.webp': 'Velvex super absorbent cotton wool 400g for wound care and clinical use.',
    'VELVEX Super Absorbent Cotton Wool 50 GRMS Cotton Wool.webp': 'Velvex super absorbent cotton wool 50g for wound care and minor first aid.',
    'VENTOLIN Evohaler 100 micrograms 200 metered actuations Inhaler.webp': 'Salbutamol 100mcg metered dose inhaler for rapid relief of asthma and bronchospasm.',
    'VIDOL Carvedilol 6.25 mg 28 Tablets Tablets.webp': 'Carvedilol 6.25mg alpha and beta blocker for heart failure and hypertension.',
    'VILESTAMINE Betamethasone and Dexchlorpheniramine Maleate 30 Tablets Tablets.webp': 'Betamethasone and dexchlorpheniramine combination for allergic conditions and inflammatory reactions.',
    'VITAGLOBIN Haematinic Syrup of Iron Folic acid & Vitamin B12 200ml Syrup.webp': 'Iron, folic acid, and vitamin B12 haematinic syrup for iron-deficiency and megaloblastic anaemia.',
    'Vitamin D3 60,000 IU D3 60K 4 Capsules.webp': 'Vitamin D3 60,000 IU high-dose capsules for correction of vitamin D deficiency.',
    'Vithiol Carbocisteine and Promethazine Hydrochloride Syrup 125 ml Liquid.webp': 'Carbocisteine and promethazine combination syrup for coughs with thick mucus.',
    'VONO-Q 20mg Vonoprazan 10 Tablets.webp': 'Vonoprazan 20mg potassium-competitive acid blocker for GERD and peptic ulcers.',
    'XTRADERM Betamethasone Dipropionate Gentamicin and Clotrimazole Cream 20g.webp': 'Betamethasone, gentamicin, and clotrimazole triple combination cream for mixed skin infections.',
    'ZENTEL 400 mg albendazole 1 Chewable Tablet.webp': 'Albendazole 400mg single chewable tablet for treatment of intestinal worm infections.',
    'Zimarc-500 500mg 30 Tablets.webp': 'Clarithromycin 500mg macrolide antibiotic for respiratory and skin infections.',
    'Zincat-OD 60ml Syrup.webp': 'Zinc supplement syrup for zinc deficiency and as adjunct therapy for diarrhoea in children.',
    'Zithrox 500mg 3 Tablets.webp': 'Azithromycin 500mg, 3-day antibiotic course for respiratory, skin, and other bacterial infections.',
    'ZOMEP-ES 20 20mg 3 x 10 Tablets.webp': 'Esomeprazole 20mg tablets for acid reflux and GERD.',
    'ZOMEP-ES 40 40mg 3 x 10 Tablets.webp': 'Esomeprazole 40mg tablets for peptic ulcers and GERD.',
    'Zupricin 15g Ointment.webp': 'Mupirocin 2% ointment for bacterial skin infections including impetigo and infected wounds.',
    'Zupricin-B Mupirocin and Betamethasone Dipropionate 15gm Ointment.webp': 'Mupirocin and betamethasone combination ointment for infected inflammatory skin conditions.',
    'Zyncet 5 x 10 Tablets.webp': 'Cetirizine 10mg antihistamine tablets for hay fever, allergic rhinitis, and urticaria.',
    'ZYNCET Cetirizine Hydrochloride Syrup 60 ml Syrup.webp': 'Cetirizine syrup 60ml for allergy relief in children.',
    'Zyrtec 0.1per_ 75ml oral solution.webp': 'Cetirizine 1mg/ml oral solution for allergic rhinitis and urticaria in children.',
})


def get_description(fn):
    desc = DESCRIPTIONS.get(fn)
    if desc:
        return desc
    # Fallback generic based on category
    cat = categorize(fn)
    name = clean_name(fn)
    fallbacks = {
        'Dewormers': f'{name} for treatment of intestinal worm infections.',
        'Antimalarials': f'{name} antimalarial treatment for uncomplicated malaria.',
        'Antibiotics': f'{name} antibiotic for bacterial infections.',
        'DiabetesCare': f'{name} for blood sugar management in type 2 diabetes.',
        'HeartAndBP': f'{name} for treatment of hypertension or heart conditions.',
        'Allergy': f'{name} antihistamine for allergy relief.',
        'Chronic': f'{name} for chronic condition management.',
        'PainRelief': f'{name} for relief of pain and inflammation.',
        'ColdAndFlu': f'{name} for cough and cold relief.',
        'Diarrhoea': f'{name} for treatment of diarrhoea.',
        'DigestiveHealth': f'{name} for digestive health and acid-related conditions.',
        'SkinConditions': f'{name} for treatment of skin conditions.',
        'MedicatedSkinCare': f'{name} topical combination for skin infections with inflammation.',
        'EyeAndEarCare': f'{name} for eye or ear conditions.',
        'OralHealth': f'{name} for oral hygiene and mouth care.',
        'Supplements': f'{name} dietary supplement for nutritional support.',
        'Omega3': f'{name} omega-3 fish oil supplement for heart and joint health.',
        'ImmuneSupport': f'{name} for immune system support.',
        'TestKits': f'{name} rapid test for health screening.',
        'Glucometers': f'{name} for blood glucose monitoring.',
        'BabyMedicines': f'{name} for infants and young children.',
        'PrenatalCare': f'{name} for prenatal nutritional support.',
        'Contraceptives': f'{name} for contraception.',
        'FeminineHealth': f'{name} for women''s health.',
        'WoundCare': f'{name} for wound care and first aid.',
        'Antiseptics': f'{name} for skin antisepsis and disinfection.',
        'PersonalCare': f'{name} for personal care and hygiene.',
        'MosquitoProtection': f'{name} for mosquito protection.',
        'Prescription': f'{name} prescription medication; consult your doctor or pharmacist.',
        'OTC': f'{name} over-the-counter medication.',
    }
    return fallbacks.get(cat, f'{name}.')


def sql_escape(s):
    return s.replace("'", "''")


files = sorted(os.listdir(PRODUCTS_DIR))
rows = []
for fn in files:
    name = sql_escape(clean_name(fn))
    cat = categorize(fn)
    desc = sql_escape(get_description(fn))
    image = sql_escape(fn)
    rows.append(f"('{name}', '{cat}', 0.00, '{desc}', '{image}', NULL, 0)")

header = "INSERT INTO `products` (`name`, `category`, `price`, `description`, `image`, `video`, `stock`) VALUES\n"
body = ',\n'.join(rows) + ';'
sql = header + body

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    f.write(sql)

print(f"Written {len(rows)} rows to {OUTPUT_FILE}")

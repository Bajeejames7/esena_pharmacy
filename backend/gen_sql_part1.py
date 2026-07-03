import os

def categorize(filename):
    f = filename.lower()

    # Prescription-only
    prescription_keywords = [
        'sildenafil', 'tadalafil', 'prednisolone', 'clomid', 'duphaston', 'primolut',
        'susten', 'progesterone', 'diane 35', 'furosemide', 'hydrochlorothiazide',
        'aldactone', 'spironolactone', 'propranolol', 'ivabradine', 'ivadin',
        'euthyrox', 'tacrovate', 'tacrolimus', 'univir', 'acyclovir',
        'nifedi-denk', 'nifedipine', 'nosic', 'doxylamine',
        'talgentis', 'clomid', 'mtm-50',
    ]
    for kw in prescription_keywords:
        if kw in f:
            return 'Prescription'

    # DiabetesCare
    for kw in ['metformin', 'glucophage', 'glucomet', 'glibenclamide', 'nogluc',
               'empagliflozin', 'empiget', 'sitagliptin', 'treviamet', 'gliclazide',
               'diamicron']:
        if kw in f:
            return 'DiabetesCare'

    # HeartAndBP
    for kw in ['amlodipine', 'amlozaar', 'amolab', 'losartan', 'carditan', 'presartan',
               'varinil', 'bisoprolol', 'concor', 'carvedilol', 'vidol', 'enaril', 'enalapril',
               'nebilong', 'nifedi', 'propranolol', 'ivabradine', 'ivadin',
               'spironolactone', 'aldactone']:
        if kw in f:
            return 'HeartAndBP'

    # Antibiotics
    for kw in ['amoxicillin', 'amoxil', 'kemoxyl', 'elymox', 'medicloamp', 'augmentin',
               'enhancin', 'acinet', 'finemox', 'ampiclo', 'ciprofloxacin', 'ciproken',
               'ceprolen', 'levobact', 'azithromycin', 'agycin', 'zithrox', 'zimarc',
               'clarithromycin', 'clariwin', 'metronidazole', 'tricozole', 'dazolic',
               'eflaron', 'co-trimoxazole', 'cosatrim', 'biotrim',
               'ofloxacin', 'ojen-oz', 'shalcip', 'bactifix', 'tetracycline', 'tracy',
               'grabacin', 'clindamycin', 'clear-t', 'diracip', 'atm 200', 'atm 500']:
        if kw in f:
            return 'Antibiotics'

    # Antimalarials
    for kw in ['artequick', 'p-alaxin', 'dihydroartemisinin', 'piperaquine',
               'artemether', 'lumefantrine']:
        if kw in f:
            return 'Antimalarials'

    # Dewormers
    for kw in ['albendazole', 'zentel', 'mebendazole', 'natoa', ' abz ']:
        if kw in f:
            return 'Dewormers'

    # Allergy
    for kw in ['cetirizine', 'rinacet', 'zyncet', 'zyrtec', 'atrizin', 'loratadine',
               'clarityne', 'lorhistina', 'clarinase', 'desloratadine', 'aerius', 'deslit',
               'desostar', 'fexofenadine', 'fexet', 'chlorpheniramine', 'piriclor', 'piriton',
               'rupatadine', 'rupatine', 'monteru', 'erostin', 'ebastine', 'oculast',
               'azelastine', 'olopat', 'olopatadine', 'cyproheptadine', 'becoactin', 'cypro b']:
        if kw in f:
            return 'Allergy'

    return None

files = sorted(os.listdir('/home/bajee/esena_pharmacy/backend/uploads/products/'))
uncategorized = []
for fn in files:
    cat = categorize(fn)
    if cat is None:
        uncategorized.append(fn)

print(f"Uncategorized so far: {len(uncategorized)}")
for u in uncategorized:
    print(" ", u)

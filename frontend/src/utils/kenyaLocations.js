/**
 * Kenya counties and their major towns/cities
 */
const kenyaLocations = {
  'Baringo': ['Kabarnet', 'Eldama Ravine', 'Mogotio', 'Marigat', 'Nginyang'],
  'Bomet': ['Bomet', 'Sotik', 'Longisa', 'Chepalungu', 'Konoin'],
  'Bungoma': ['Bungoma', 'Webuye', 'Kimilili', 'Chwele', 'Malakisi'],
  'Busia': ['Busia', 'Malaba', 'Nambale', 'Butula', 'Funyula'],
  'Elgeyo-Marakwet': ['Iten', 'Eldoret East', 'Keiyo', 'Marakwet'],
  'Embu': ['Embu', 'Runyenjes', 'Manyatta', 'Siakago'],
  'Garissa': ['Garissa', 'Dadaab', 'Fafi', 'Ijara', 'Lagdera'],
  'Homa Bay': ['Homa Bay', 'Oyugis', 'Kendu Bay', 'Mbita', 'Ndhiwa'],
  'Isiolo': ['Isiolo', 'Merti', 'Garbatulla'],
  'Kajiado': ['Kajiado', 'Ngong', 'Kitengela', 'Ongata Rongai', 'Namanga', 'Loitokitok'],
  'Kakamega': ['Kakamega', 'Mumias', 'Butere', 'Khayega', 'Lugari'],
  'Kericho': ['Kericho', 'Litein', 'Londiani', 'Kipkelion'],
  'Kiambu': ['Thika', 'Ruiru', 'Kiambu', 'Limuru', 'Kikuyu', 'Githunguri', 'Gatundu', 'Karuri'],
  'Kilifi': ['Kilifi', 'Malindi', 'Mtwapa', 'Watamu', 'Kaloleni', 'Mariakani'],
  'Kirinyaga': ['Kerugoya', 'Kutus', 'Sagana', 'Kagio', 'Wanguru'],
  'Kisii': ['Kisii', 'Ogembo', 'Keroka', 'Nyamache', 'Suneka'],
  'Kisumu': ['Kisumu', 'Ahero', 'Muhoroni', 'Maseno', 'Kombewa'],
  'Kitui': ['Kitui', 'Mwingi', 'Mutomo', 'Migwani', 'Zombe'],
  'Kwale': ['Kwale', 'Ukunda', 'Msambweni', 'Kinango', 'Lungalunga'],
  'Laikipia': ['Nanyuki', 'Nyahururu', 'Rumuruti', 'Doldol'],
  'Lamu': ['Lamu', 'Mpeketoni', 'Witu', 'Mokowe'],
  'Machakos': ['Machakos', 'Athi River', 'Kangundo', 'Tala', 'Matuu', 'Mwala'],
  'Makueni': ['Wote', 'Emali', 'Kibwezi', 'Makindu', 'Sultan Hamud'],
  'Mandera': ['Mandera', 'Elwak', 'Rhamu', 'Takaba'],
  'Marsabit': ['Marsabit', 'Moyale', 'Laisamis', 'North Horr'],
  'Meru': ['Meru', 'Nkubu', 'Maua', 'Timau', 'Chuka', 'Mikinduri'],
  'Migori': ['Migori', 'Awendo', 'Rongo', 'Uriri', 'Isebania'],
  'Mombasa': ['Mombasa', 'Nyali', 'Bamburi', 'Likoni', 'Changamwe', 'Kisauni'],
  "Murang'a": ["Murang'a", 'Kangema', 'Maragua', 'Kandara', 'Gatanga', 'Kigumo'],
  'Nairobi': ['Westlands', 'Kasarani', 'Embakasi', 'Langata', 'Dagoretti', 'Starehe', 'Makadara', 'Kibra', 'Roysambu', 'Ruaraka'],
  'Nakuru': ['Nakuru', 'Naivasha', 'Gilgil', 'Molo', 'Njoro', 'Rongai', 'Subukia'],
  'Nandi': ['Kapsabet', 'Nandi Hills', 'Mosoriot', 'Kobujoi'],
  'Narok': ['Narok', 'Kilgoris', 'Ololulunga', 'Suswa'],
  'Nyamira': ['Nyamira', 'Keroka', 'Nyansiongo', 'Manga'],
  'Nyandarua': ['Ol Kalou', 'Engineer', 'Ndaragwa', 'Kinangop'],
  'Nyeri': ['Nyeri', 'Karatina', 'Othaya', 'Mukurweini', 'Tetu'],
  'Samburu': ['Maralal', 'Baragoi', 'Wamba'],
  'Siaya': ['Siaya', 'Bondo', 'Ugunja', 'Yala', 'Ukwala'],
  'Taita-Taveta': ['Voi', 'Wundanyi', 'Taveta', 'Mwatate'],
  'Tana River': ['Hola', 'Garsen', 'Bura'],
  'Tharaka-Nithi': ['Chuka', 'Marimanti', 'Kathwana'],
  'Trans Nzoia': ['Kitale', 'Kiminini', 'Saboti', 'Endebess'],
  'Turkana': ['Lodwar', 'Kakuma', 'Lokichar', 'Kalokol'],
  'Uasin Gishu': ['Eldoret', 'Turbo', 'Moiben', 'Ainabkoi', 'Kapseret'],
  'Vihiga': ['Vihiga', 'Mbale', 'Luanda', 'Hamisi'],
  'Wajir': ['Wajir', 'Habaswein', 'Bute', 'Eldas'],
  'West Pokot': ['Kapenguria', 'Sigor', 'Alale', 'Kacheliba'],
};

export const countyOptions = [
  ...Object.keys(kenyaLocations).sort().map(county => ({
    value: county,
    label: county,
  })),
];

export const getTownOptions = (county) => {
  if (!county || !kenyaLocations[county]) return [];
  return kenyaLocations[county].map(town => ({ value: town, label: town }));
};

export default kenyaLocations;

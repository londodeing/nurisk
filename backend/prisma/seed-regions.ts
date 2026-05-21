import { PrismaClient, RegionType, type Prisma } from '@prisma/client';
import { provinces } from './data/provinces';
import { districts } from './data/districts';

const prisma = new PrismaClient();

const KECAMATAN_NAMES = [
  'Banjarsari', 'Cibeureum', 'Cikole', 'Cimahi', 'Ciputat',
  'Cisarua', 'Coblong', 'Gambir', 'Grogol', 'Jatinegara',
  'Kebayoran Baru', 'Kebon Jeruk', 'Kembangan', 'Klari',
  'Kramatjati', 'Makasar', 'Mampang Prapatan', 'Matraman',
  'Pademangan', 'Palmerah', 'Pancoran', 'Pasar Minggu',
  'Pasar Rebo', 'Pesanggrahan', 'Pulo Gadung', 'Sawah Besar',
  'Senen', 'Setiabudi', 'Taman Sari', 'Tambora', 'Tanah Abang',
  'Tanjung Priok', 'Tapos', 'Ujung Pandang', 'Ujung Tanah',
  'Wonocolo', 'Wonokromo', 'Gubeng', 'Sukolilo', 'Mulyorejo',
  'Rungkut', 'Tandes', 'Karang Pilang', 'Dukuh Pakis',
  'Lakarsantri', 'Sambikerep', 'Genteng', 'Keputih',
  'Bulak', 'Kenjeran', 'Simokerto', 'Semampir', 'Krembangan',
  'Pabean Cantian', 'Bubutan', 'Tegalsari', 'Sawahan',
  'Wonokusumo', 'Candasari', 'Cinangka', 'Gunungsari',
  'Serdang', 'Margaasih', 'Padalarang', 'Batujajar',
  'Cipatat', 'Cipeundeuy', 'Cikalong Wetan', 'Cililin',
  'Gununghalu', 'Rongga', 'Sindangkerta', 'Saguling',
  'Melong', 'Cimahi Selatan', 'Cimahi Tengah', 'Cimahi Utara',
  'Lembang', 'Parongpong', 'Cisarua', 'Ngamprah',
  'Tanah Sereal', 'Bogor Barat', 'Bogor Timur', 'Bogor Utara',
  'Bogor Selatan', 'Bogor Tengah', 'Tanah Sareal',
  'Cilandak', 'Kebayoran Lama', 'Kebayoran Baru', 'Mampang Prapatan',
  'Pancoran', 'Pasar Minggu', 'Pesanggrahan', 'Setia Budi',
  'Tebet', 'Cakung', 'Cipayung', 'Ciracas', 'Duren Sawit',
  'Jatinegara', 'Kramat Jati', 'Makasar', 'Matraman',
  'Pasar Rebo', 'Pulo Gadung', 'Cengkareng', 'Grogol Petamburan',
  'Kalideres', 'Kebon Jeruk', 'Kembangan', 'Palmerah',
  'Taman Sari', 'Tambora', 'Cilincing', 'Koja', 'Kelapa Gading',
  'Pademangan', 'Penjaringan', 'Tanjung Priok',
  'Gambir', 'Johar Baru', 'Kemayoran', 'Menteng',
  'Sawah Besar', 'Senen', 'Tanah Abang',
  'Denpasar Barat', 'Denpasar Timur', 'Denpasar Selatan', 'Denpasar Utara',
  'Kuta', 'Kuta Selatan', 'Kuta Utara', 'Mengwi',
  'Abiansemal', 'Petang', 'Baturiti', 'Penebel',
  'Selemadeg', 'Kerambitan', 'Tabanan', 'Kediri',
  'Karangasem', 'Abang', 'Bebandem', 'Rendang',
  'Selat', 'Sidemen', 'Bangli', 'Kintamani', 'Susut',
  'Tembuku', 'Gianyar', 'Blahbatuh', 'Sukawati',
  'Tampaksiring', 'Ubud', 'Klungkung', 'Banjarangkan',
  'Dawan', 'Nusapenida', 'Buleleng', 'Banjar', 'Busungbiu',
  'Gerokgak', 'Kubutambahan', 'Sawan', 'Seririt',
  'Sukasada', 'Tejakula',
  'Medan Kota', 'Medan Sunggal', 'Medan Helvetia', 'Medan Area',
  'Medan Timur', 'Medan Perjuangan', 'Medan Barat', 'Medan Baru',
  'Medan Selayang', 'Medan Tuntungan', 'Medan Johor', 'Medan Amplas',
  'Medan Denai', 'Medan Marelan', 'Medan Labuhan', 'Medan Belawan',
  'Binjai Kota', 'Binjai Utara', 'Binjai Timur', 'Binjai Selatan',
  'Binjai Barat', 'Padang Hilir', 'Padang Hulu',
  'Tebing Tinggi Kota', 'Rambutan', 'Bajenis',
  'Siantar Barat', 'Siantar Timur', 'Siantar Utara', 'Siantar Selatan',
  'Siantar Marihat', 'Siantar Marimbun', 'Siantar Martoba',
  'Siantar Sitalasari', 'Kisaran Barat', 'Kisaran Timur',
  'Tanah Jawa', 'Pematang Bandar', 'Bandar', 'Bosar Maligas',
  'Ujung Padang', 'Panei', 'Raya', 'Dolok Panribuan',
  'Dolok Silau', 'Silau Kahean', 'Jorlang Hataran',
  'Butar Butar', 'Girsang Sipangan Bolon',
  'Surabaya', 'Jakarta', 'Bandung', 'Semarang', 'Yogyakarta',
  'Solo', 'Malang', 'Denpasar', 'Makassar', 'Medan',
  'Palembang', 'Pekanbaru', 'Banjarmasin', 'Pontianak',
  'Samarinda', 'Manado', 'Padang', 'Tanjungkarang',
  'Batam', 'Mataram', 'Kupang', 'Ambon', 'Jayapura',
  'Balikpapan', 'Jambi', 'Bengkulu', 'Palu', 'Kendari',
  'Gorontalo', 'Ternate', 'Serang', 'Cilegon', 'Cimahi',
  'Tasikmalaya', 'Sukabumi', 'Cirebon', 'Pekalongan', 'Tegal',
  'Madiun', 'Kediri', 'Blitar', 'Pasuruan', 'Probolinggo',
  'Magelang', 'Salatiga', 'Batu', 'Mojokerto', 'Parepare',
  'Bitung', 'Tomohon', 'Kotamobagu', 'Tarakan', 'Lhokseumawe',
  'Langsa', 'Sabang', 'Banda Aceh', 'Subulussalam',
  'Dumai', 'Pagar Alam', 'Lubuklinggau', 'Prabumulih',
  'Bengkulu', 'Pangkalpinang', 'Tanjungpinang',
  'Metro', 'Bandar Lampung', 'Tangerang',
  'Tangerang Selatan', 'Cilegon', 'Serang', 'Sungai Penuh',
  'Padang Panjang', 'Bukittinggi', 'Payakumbuh', 'Pariaman',
  'Sawahlunto', 'Solok', 'Banjarbaru',
  'Singkawang', 'Palangka Raya', 'Bontang', 'Baubau',
  'Gunungsitoli', 'Padangsidimpuan', 'Tanjungbalai',
  'Binjai', 'Tebing Tinggi', 'Pematangsiantar', 'Sibolga',
  'Sorong', 'Tual', 'Tidore', 'Bima',
];

const VILLAGE_NAMES = [
  'Margahayu', 'Margaluyu', 'Margamulya', 'Mekarjaya', 'Mekarsari',
  'Mekarwangi', 'Cibaduyut', 'Cibabat', 'Cibeber', 'Cibinong',
  'Cicadas', 'Cidahu', 'Cigugur', 'Cihaur', 'Cikalang',
  'Cikaret', 'Cikembang', 'Cikole', 'Cilebak', 'Cilengkrang',
  'Cilimus', 'Cimahi', 'Cimanggu', 'Cimareme', 'Cimuncang',
  'Cinere', 'Cingambul', 'Cipadung', 'Cipaku', 'Ciparay',
  'Cipeundeuy', 'Cipicung', 'Cipondoh', 'Cireundeu', 'Cisalak',
  'Cisarua', 'Ciseureuh', 'Cisitu', 'Citamiang', 'Citeureup',
  'Ciwaruga', 'Sukajadi', 'Sukakarya', 'Sukamaju', 'Sukamandi',
  'Sukamulya', 'Sukanagara', 'Sukapura', 'Sukaraja', 'Sukarame',
  'Sukasari', 'Sukasenang', 'Sukatani', 'Sukawening',
  'Karanganyar', 'Karangasem', 'Karangjati', 'Karangmulya',
  'Karangsari', 'Karangtengah', 'Karangwangkal',
  'Babakan', 'Babakan Ciparay', 'Babakan Tarogong',
  'Caringin', 'Cibaduyut', 'Cibangkong', 'Cibuntu',
  'Cijerah', 'Cikawao', 'Cikudapateuh', 'Cimuncang',
  'Cisaranten Wetan', 'Dago', 'Garuda', 'Kebon Gedang',
  'Kebon Kangkung', 'Kebon Lega', 'Kebon Pisang',
  'Kopo', 'Lebakgede', 'Lebak Siliwangi', 'Maleer',
  'Margahayu Raya', 'Mekar Mulya', 'Mengger',
  'Padasuka', 'Pasirjati', 'Pasirluyu', 'Pasirwangi',
  'Sarijadi', 'Sukabungah', 'Sukagalih', 'Sukahaji',
  'Sukamiskin', 'Sukapada', 'Sukawarna', 'Turangga',
  'Taman', 'Tamansari', 'Kota Baru', 'Karang Anyar',
  'Kebon Jeruk', 'Kebon Melati', 'Kramat', 'Pasar Baru',
  'Pasar Manggis', 'Petamburan', 'Petojo', 'Roxy',
  'Slipi', 'Tomang', 'Angke', 'Duri Kepa', 'Duri Pulo',
  'Glodok', 'Krendang', 'Cideng', 'Gambir', 'Kebon Kelapa',
  'Kebon Kacang', 'Menteng', 'Pegangsaan', 'Cempaka Putih',
  'Gunung Sahari', 'Johar Baru', 'Galur', 'Tanah Tinggi',
  'Karet', 'Kuningan', 'Mampang', 'Pondok Indah',
  'Ragunan', 'Bendungan Hilir', 'Bukit Duri',
  'Cikoko', 'Guntur', 'Kebon Baru', 'Manggarai',
  'Pancoran', 'Rawa Bunga', 'Tebet Barat', 'Tebet Timur',
  'Ancol', 'Kamal Muara', 'Kapuk', 'Pejagalan',
  'Penjaringan', 'Pluit', 'Cilincing', 'Kalibaru',
  'Marunda', 'Rorotan', 'Kelapa Gading Barat', 'Kelapa Gading Timur',
  'Pademangan Barat', 'Pademangan Timur', 'Warakas',
  'Cipinang', 'Halim Perdana Kusuma', 'Jatinegara', 'Kampung Melayu',
  'Kebon Nanas', 'Klender', 'Pisangan Baru', 'Pulo Gadung',
  'Rawamangun', 'Utan Kayu', 'Cawang', 'Cililitan',
  'Dukuh', 'Kalisari', 'Lubang Buaya', 'Pondok Kelapa',
  'Pondok Kopi', 'Baleendah', 'Banjaran', 'Bojongsoang',
  'Cangkuang', 'Dayeuhkolot', 'Katapang', 'Kertasari',
  'Majalaya', 'Margahayu', 'Pacet', 'Paseh', 'Rancaekek',
  'Solokan Jeruk', 'Cicalengka', 'Cikancung', 'Cileunyi',
  'Cilengkrang', 'Cimenyan', 'Ciparay', 'Ibun', 'Nagreg',
  'Ranca Bali', 'Cikampek', 'Jatisari', 'Kotabaru',
  'Lemahabang', 'Banyumanik', 'Candisari',
  'Gajahmungkur', 'Gayamsari', 'Genuk', 'Gunungpati',
  'Mijen', 'Ngaliyan', 'Pedurungan', 'Semarang Barat',
  'Semarang Selatan', 'Semarang Tengah', 'Semarang Timur', 'Semarang Utara',
  'Tembalang', 'Tugu', 'Jebres', 'Laweyan',
  'Pasar Kliwon', 'Serengan', 'Gondokusuman', 'Gondomanan',
  'Danurejan', 'Gedongtengen', 'Jetis', 'Kotagede',
  'Kraton', 'Mantrijeron', 'Mergangsan', 'Ngampilan',
  'Pakualaman', 'Tegalrejo', 'Umbulharjo', 'Wirobrajan',
  'Blimbing', 'Kedungkandang', 'Klojen', 'Lowokwaru',
  'Sukun', 'Arjowinangun', 'Bantur', 'Dampit', 'Dau',
  'Donomulyo', 'Gadang', 'Gedangan', 'Gondanglegi',
  'Jabung', 'Kajoran', 'Karangploso', 'Kasembon',
  'Kepanjen', 'Kromengan', 'Lawang', 'Ngajung',
  'Ngantang', 'Pagak', 'Pagelaran', 'Pakis', 'Pakisaji',
  'Poncokusumo', 'Pujon', 'Singosari', 'Sumbermanjing',
  'Sumberpucung', 'Tajinan', 'Tirtoyudo', 'Tumpang',
  'Turen', 'Wagir', 'Wajak', 'Wonosari',
  'Batu', 'Bumiaji', 'Junrejo',
  'Genteng', 'Gubeng', 'Jambangan', 'Karangpilang',
  'Krembangan', 'Lakarsantri', 'Mulyorejo', 'Pabean Cantian',
  'Pakal', 'Rungkut', 'Sambikerep', 'Sawahan',
  'Semampir', 'Simokerto', 'Sukolilo', 'Sukomanunggal',
  'Tambaksari', 'Tandes', 'Tegalsari', 'Tenggilis Mejoyo',
  'Wiyung', 'Wonocolo', 'Wonokromo',
];

const BATCH_SIZE = 5000;

async function main() {
  console.log('Seeding regions...');

  if (provinces.length !== 34) {
    console.warn(`Expected 34 provinces, got ${provinces.length}`);
  }

  const provinceMap = new Map<string, string>();

  for (const province of provinces) {
    const record = await prisma.region.upsert({
      where: { code: province.code },
      update: { name: province.name, regionType: RegionType.PROVINCE },
      create: {
        code: province.code,
        name: province.name,
        regionType: RegionType.PROVINCE,
      },
    });
    provinceMap.set(province.code, record.id);
    console.log(`Province: ${province.name} (${province.code})`);
  }

  const districtMap = new Map<string, { id: string; name: string }>();

  for (const district of districts) {
    const parentId = provinceMap.get(district.provinceCode);
    if (!parentId) {
      console.warn(`Parent province ${district.provinceCode} not found for ${district.name}`);
      continue;
    }
    const record = await prisma.region.upsert({
      where: { code: district.code },
      update: {
        name: district.name,
        regionType: RegionType.DISTRICT,
        parentId,
      },
      create: {
        code: district.code,
        name: district.name,
        regionType: RegionType.DISTRICT,
        parentId,
      },
    });
    districtMap.set(district.code, { id: record.id, name: district.name });
  }
  console.log(`Seeded ${districts.length} districts`);

  await prisma.region.deleteMany({
    where: { regionType: RegionType.VILLAGE },
  });
  await prisma.region.deleteMany({
    where: { regionType: RegionType.SUB_DISTRICT },
  });

  const kecamatanRecords: Prisma.RegionCreateManyInput[] = [];
  let nameIndex = 0;
  let totalSubDistricts = 0;

  for (const [districtCode, districtInfo] of districtMap) {
    const numKecamatan = Math.min(
      5 + (totalSubDistricts % 12),
      18,
    );

    for (let i = 1; i <= numKecamatan; i++) {
      const kecCode = `${districtCode}${String(i).padStart(2, '0')}`;
      const name = KECAMATAN_NAMES[nameIndex % KECAMATAN_NAMES.length];
      nameIndex++;
      kecamatanRecords.push({
        code: kecCode,
        name,
        regionType: RegionType.SUB_DISTRICT,
        parentId: districtInfo.id,
      });
    }
    totalSubDistricts += numKecamatan;
  }

  for (let i = 0; i < kecamatanRecords.length; i += BATCH_SIZE) {
    const batch = kecamatanRecords.slice(i, i + BATCH_SIZE);
    await prisma.region.createMany({ data: batch });
  }
  console.log(`Seeded ${totalSubDistricts} sub-districts`);

  const kecamatanRows = await prisma.region.findMany({
    where: { regionType: RegionType.SUB_DISTRICT, code: { not: null } },
    select: { id: true, code: true },
  });

  const villageRecords: Prisma.RegionCreateManyInput[] = [];
  nameIndex = 0;
  let totalVillages = 0;

  for (const kec of kecamatanRows) {
    if (!kec.code) continue;
    const numVillages = Math.min(5 + (totalVillages % 10), 15);

    for (let i = 1; i <= numVillages; i++) {
      const vilCode = `${kec.code}${String(i).padStart(4, '0')}`;
      const name = `Desa ${VILLAGE_NAMES[nameIndex % VILLAGE_NAMES.length]}`;
      nameIndex++;
      villageRecords.push({
        code: vilCode,
        name,
        regionType: RegionType.VILLAGE,
        parentId: kec.id,
      });
    }
    totalVillages += numVillages;
  }

  for (let i = 0; i < villageRecords.length; i += BATCH_SIZE) {
    const batch = villageRecords.slice(i, i + BATCH_SIZE);
    await prisma.region.createMany({ data: batch });
  }
  console.log(`Seeded ${totalVillages} villages`);

  console.log('Region seeding completed successfully');
}

export { main as seedRegions };

if (process.argv[1]?.includes('seed-regions')) {
  main()
    .catch((e) => {
      console.error('Region seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

/**
 * Nigeria → State / FCT area council → Local government area.
 *
 * SOURCE AND PROVENANCE
 * Transformed from `lgas.json` in github.com/xosasx/nigerian-local-government-areas
 * (MIT, (c) 2022 Osas Obazee), fetched 21 October 2026 and checked before it was
 * committed here:
 *   - 774 rows, 37 distinct states — the official figure exactly.
 *   - Per-state checksums matched the known ones: Lagos 20, Kano 44, Bayelsa 8,
 *     FCT 6. Zero rows missing a name or a state. Zero duplicates within a state.
 *   - Six LGA names recur in two different states (Obi, Nasarawa, Bassa,
 *     Ifelodun, Irepodun, Surulere). An LGA name is therefore NOT a key; the
 *     `state/lga` id below is, and that is what a listing or address stores.
 * Names are the source's, unedited, with one exception: Kano's `kumbotso` is
 * capitalised. The source also carries minor spelling variants (`DanDume`,
 * `Umu-Nneochi`) which are left as published rather than guessed at — correct
 * them against INEC's polling-unit directory, not from memory.
 *
 * There is deliberately no third level here. No free source provides Nigerian
 * towns and neighbourhoods at a size a static site can ship (geoBoundaries has
 * no Nigeria ADM3; GeoNames' Nigeria file is 76,332 rows), so the UI asks for
 * the area as free text instead of inventing a list.
 */

/** One line per state: `State|Lga,Lga,Lga`, alphabetically ordered. */
const SOURCE = `Abia|Aba North,Aba South,Arochukwu,Bende,Ikwuano,Isiala Ngwa North,Isiala Ngwa South,Isuikwuato,Obi Ngwa,Ohafia,Osisioma,Ugwunagbo,Ukwa East,Ukwa West,Umuahia North,Umuahia South,Umu-Nneochi
Adamawa|Demsa,Fufore,Ganye,Girei,Gombi,Guyuk,Hong,Jada,Lamurde,Madagali,Maiha,Mayo Belwa,Michika,Mubi North,Mubi South,Numan,Shelleng,Song,Toungo,Yola North,Yola South
Akwa Ibom|Abak,Eastern Obolo,Eket,Esit Eket,Essien Udim,Etim Ekpo,Etinan,Ibeno,Ibesikpo Asutan,Ibiono Ibom,Ika,Ikono,Ikot Abasi,Ikot Ekpene,Ini,Itu,Mbo,Mkpat Enin,Nsit Atai,Nsit Ibom,Nsit Ubium,Obot Akara,Okobo,Onna,Oron,Oruk Anam,Udung Uko,Ukanafun,Uruan,Urue Offong/Oruko,Uyo
Anambra|Aguata,Anambra East,Anambra West,Anaocha,Awka North,Awka South,Ayamelum,Dunukofia,Ekwusigo,Idemili North,Idemili South,Ihiala,Njikoka,Nnewi North,Nnewi South,Ogbaru,Onitsha North,Onitsha South,Orumba North,Orumba South,Oyi
Bauchi|Alkaleri,Bauchi,Bogoro,Damban,Darazo,Dass,Gamawa,Ganjuwa,Giade,Itas/Gadau,Jama'are,Katagum,Kirfi,Misau,Ningi,Shira,Tafawa Balewa,Toro,Warji,Zaki
Bayelsa|Brass,Ekeremor,Kolokuma/Opokuma,Nembe,Ogbia,Sagbama,Southern Ijaw,Yenagoa
Benue|Ado,Agatu,Apa,Buruku,Gboko,Guma,Gwer East,Gwer West,Katsina Ala,Konshisha,Kwande,Logo,Makurdi,Obi,Ogbadibo,Ohimini,Oju,Okpokwu,Otukpo,Tarka,Ukum,Ushongo,Vandeikya
Borno|Abadam,Askira/Uba,Bama,Bayo,Biu,Chibok,Damboa,Dikwa,Gubio,Guzamala,Gwoza,Hawul,Jere,Kaga,Kala/Balge,Konduga,Kukawa,Kwaya Kusar,Mafa,Magumeri,Maiduguri,Marte,Mobbar,Monguno,Ngala,Nganzai,Shani
Cross River|Abi,Akamkpa,Akpabuyo,Bakassi,Bekwarra,Biase,Boki,Calabar Municipal,Calabar South,Etung,Ikom,Obanliku,Obubra,Obudu,Odukpani,Ogoja,Yakurr,Yala
Delta|Aniocha North,Aniocha South,Bomadi,Burutu,Ethiope East,Ethiope West,Ika North East,Ika South,Isoko North,Isoko South,Ndokwa East,Ndokwa West,Okpe,Oshimili North,Oshimili South,Patani,Sapele,Udu,Ughelli North,Ughelli South,Ukwuani,Uvwie,Warri North,Warri South,Warri South West
Ebonyi|Abakaliki,Afikpo North,Afikpo South,Ebonyi,Ezza North,Ezza South,Ikwo,Ishielu,Ivo,Izzi,Ohaozara,Ohaukwu,Onicha
Edo|Akoko Edo,Egor,Esan Central,Esan North East,Esan South East,Esan West,Etsako Central,Etsako East,Etsako West,Igueben,Ikpoba Okha,Oredo,Orhionmwon,Ovia North East,Ovia South West,Owan East,Owan West,Uhunmwonde
Ekiti|Ado-Ekiti,Efon,Ekiti East,Ekiti South West,Ekiti West,Emure,Gbonyin,Ido-Osi,Ijero,Ikere,Ikole,Ilejemeje,Irepodun/Ifelodun,Ise/Orun,Moba,Oye
Enugu|Aninri,Awgu,Enugu East,Enugu North,Enugu South,Ezeagu,Igbo Etiti,Igbo Eze North,Igbo Eze South,Isi-Uzo,Nkanu East,Nkanu West,Nsukka,Oji-River,Udenu,Udi,Uzo-Uwani
Federal Capital Territory|Abaji,Abuja,Bwari,Gwagwalada,Kuje,Kwali
Gombe|Akko,Balanga,Billiri,Dukku,Funakaye,Gombe,Kaltungo,Kwami,Nafada,Shongom,Yamaltu/Deba
Imo|Aboh Mbaise,Ahiazu Mbaise,Ehime Mbano,Ezinihitte Mbaise,Ideato North,Ideato South,Ihitte/Uboma,Ikeduru,Isiala Mbano,Isu,Mbaitoli,Ngor Okpala,Njaba,Nkwerre,Nwangele,Obowo,Oguta,Ohaji/Egbema,Okigwe,Onuimo,Orlu,Orsu,Oru East,Oru West,Owerri Municipal,Owerri North,Owerri West
Jigawa|Auyo,Babura,Biriniwa,Birnin Kudu,Buji,Dutse,Gagarawa,Garki,Gumel,Guri,Gwaram,Gwiwa,Hadejia,Jahun,Kafin Hausa,Kaugama,Kazaure,Kiri Kasama,Kiyawa,Maigatari,Malam Madori,Miga,Ringim,Roni,Sule Tankarkar,Taura,Yankwashi
Kaduna|Birnin Gwari,Chikun,Giwa,Igabi,Ikara,Jaba,Jema'a,Kachia,Kaduna North,Kaduna South,Kagarko,Kajuru,Kaura,Kauru,Kubau,Kudan,Lere,Makarfi,Sabon Gari,Sanga,Soba,Zangon Kataf,Zaria
Kano|Ajingi,Albasu,Bagwai,Bebeji,Bichi,Bunkure,Dala,Dambatta,Dawakin Kudu,Dawakin Tofa,Doguwa,Fagge,Gabasawa,Garko,Garun Malam,Gaya,Gezawa,Gwale,Gwarzo,Kabo,Kano Municipal,Karaye,Kibiya,Kiru,Kumbotso,Kunchi,Kura,Madobi,Makoda,Minjibir,Nasarawa,Rano,Rimin Gado,Rogo,Shanono,Sumaila,Takai,Tarauni,Tofa,Tsanyawa,Tudun Wada,Ungogo,Warawa,Wudil
Katsina|Bakori,Batagarawa,Batsari,Baure,Bindawa,Charanchi,Dan Musa,DanDume,Danja,Daura,Dutsi,Dutsin-Ma,Faskari,Funtua,Ingawa,Jibia,Kafur,Kaita,Kankara,Kankia,Katsina,Kurfi,Kusada,Mai'Adua,Malumfashi,Mani,Mashi,Matazu,Musawa,Rimi,Sabuwa,Safana,Sandamu,Zango
Kebbi|Aliero,Arewa Dandi,Argungu,Augie,Bagudo,Birnin Kebbi,Bunza,Dandi,Danko-Wasagu,Fakai,Gwandu,Jega,Kalgo,Koko/Besse,Maiyama,Ngaski,Sakaba,Shanga,Suru,Yauri,Zuru
Kogi|Adavi,Ajaokuta,Ankpa,Bassa,Dekina,Ibaji,Idah,Igalamela Odolu,Ijumu,Kabba/Bunu,Kogi,Lokoja,Mopa-Muro,Ofu,Ogori/Magongo,Okehi,Okene,Olamaboro,Omala,Yagba East,Yagba West
Kwara|Asa,Baruten,Edu,Ekiti,Ifelodun,Ilorin East,Ilorin South,Ilorin West,Irepodun,Isin,Kaiama,Moro,Offa,Oke-Ero,Oyun,Pategi
Lagos|Agege,Ajeromi-Ifelodun,Alimosho,Amuwo-Odofin,Apapa,Badagry,Epe,Eti-Osa,Ibeju-Lekki,Ifako-Ijaiye,Ikeja,Ikorodu,Kosofe,Lagos Island,Lagos Mainland,Mushin,Ojo,Oshodi-Isolo,Somolu,Surulere
Nasarawa|Akwanga,Awe,Doma,Karu,Keana,Keffi,Kokona,Lafia,Nasarawa,Nasarawa Egon,Obi,Toto,Wamba
Niger|Agaie,Agwara,Bida,Borgu,Bosso,Chanchaga,Edati,Gbako,Gurara,Katcha,Kontagora,Lapai,Lavun,Magama,Mariga,Mashegu,Mokwa,Munya,Paikoro,Rafi,Rijau,Shiroro,Suleja,Tafa,Wushishi
Ogun|Abeokuta North,Abeokuta South,Ado-Odo/Ota,Ewekoro,Ifo,Ijebu East,Ijebu North,Ijebu North East,Ijebu Ode,Ikenne,Imeko Afon,Ipokia,Obafemi Owode,Odeda,Odogbolu,Ogun Waterside,Remo North,Shagamu,Yewa North,Yewa South
Ondo|Akoko North East,Akoko North West,Akoko South East,Akoko South West,Akure North,Akure South,Ese Odo,Idanre,Ifedore,Ilaje,Ile Oluji/Okeigbo,Irele,Odigbo,Okitipupa,Ondo East,Ondo West,Ose,Owo
Osun|Aiyedire,Atakunmosa East,Atakunmosa West,Ayedaade,Boluwaduro,Boripe,Ede North,Ede South,Egbedore,Ejigbo,Ife Central,Ife East,Ife North,Ife South,Ifedayo,Ifelodun,Ila,Ilesa East,Ilesa West,Irepodun,Irewole,Isokan,Iwo,Obokun,Odo-Otin,Ola-Oluwa,Olorunda,Oriade,Orolu,Osogbo
Oyo|Afijio,Akinyele,Atiba,Atisbo,Egbeda,Ibadan North,Ibadan North East,Ibadan North West,Ibadan South East,Ibadan South West,Ibarapa Central,Ibarapa East,Ibarapa North,Ido,Irepo,Iseyin,Itesiwaju,Iwajowa,Kajola,Lagelu,Ogbomosho North,Ogbomosho South,Ogo Oluwa,Olorunsogo,Oluyole,Ona Ara,Oorelope,Ori Ire,Oyo East,Oyo West,Saki East,Saki West,Surulere
Plateau|Barkin Ladi,Bassa,Bokkos,Jos East,Jos North,Jos South,Kanam,Kanke,Langtang North,Langtang South,Mangu,Mikang,Pankshin,Qua'an Pan,Riyom,Shendam,Wase
Rivers|Abua-Odual,Ahoada East,Ahoada West,Akuku-Toru,Andoni,Asari-Toru,Bonny,Degema,Eleme,Emohua,Etche,Gokana,Ikwerre,Khana,Obio/Akpor,Ogba/Egbema/Ndoni,Ogu/Bolo,Okrika,Omuma,Opobo/Nkoro,Oyigbo,Port Harcourt,Tai
Sokoto|Binji,Bodinga,Dange/Shuni,Gada,Goronyo,Gudu,Gwadabawa,Illela,Isa,Kebbe,Kware,Rabah,Sabon Birni,Shagari,Silame,Sokoto North,Sokoto South,Tambuwal,Tangaza,Tureta,Wamako,Wurno,Yabo
Taraba|Ardo Kola,Bali,Donga,Gashaka,Gassol,Ibi,Jalingo,Karim Lamido,Kurmi,Lau,Sardauna,Takum,Ussa,Wukari,Yorro,Zing
Yobe|Bade,Bursari,Damaturu,Fika,Fune,Geidam,Gujba,Gulani,Jakusko,Karasuwa,Machina,Nangere,Nguru,Potiskum,Tarmuwa,Yunusari,Yusufari
Zamfara|Anka,Bakura,Birnin Magaji/Kiyaw,Bukkuyum,Bungudu,Gummi,Gusau,Kaura Namoda,Maradun,Maru,Shinkafi,Talata Mafara,Tsafe,Zurmi`;

export interface NgLga {
  /** `state-slug/lga-slug`, e.g. `lagos/ikeja`. The stable key to store. */
  id: string;
  name: string;
  stateId: string;
}

export interface NgState {
  id: string;
  name: string;
  /** True for the FCT, whose six units are area councils, not LGAs. */
  isFct: boolean;
  lgas: NgLga[];
}

/** `Ado-Odo/Ota` → `ado-odo-ota`. Only ASCII letters and digits survive. */
export function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Order by lowercased name using plain code-point comparison, not
 * `localeCompare`. Two reasons: the dropdown's order then does not depend on
 * the runtime's locale data, and it matches the order the source lines were
 * written in, so the file reads the way the picker behaves. Hyphenated names
 * (`Umu-Nneochi`) therefore sort with the punctuation, ahead of `Umuahia`.
 */
function byName<T extends { name: string }>(a: T, b: T): number {
  const x = a.name.toLowerCase();
  const y = b.name.toLowerCase();
  return x < y ? -1 : x > y ? 1 : 0;
}

function build(): NgState[] {
  return SOURCE.trim()
    .split("\n")
    .map((line) => {
      const [state, list] = line.split("|");
      const stateId = slug(state);
      return {
        id: stateId,
        name: state,
        isFct: stateId === "federal-capital-territory",
        lgas: list
          .split(",")
          .filter(Boolean)
          .map((name) => ({ id: `${stateId}/${slug(name)}`, name, stateId }))
          // Sorted here rather than trusted from the file, so a future edit that
          // appends a name cannot silently change what users see.
          .sort(byName),
      };
    })
    .sort(byName);
}

export const NG_STATES_LIST: NgState[] = build();

const STATE_INDEX = new Map(NG_STATES_LIST.map((s) => [s.id, s]));
const LGA_INDEX = new Map(
  NG_STATES_LIST.flatMap((s) => s.lgas.map((l) => [l.id, l] as const)),
);

/** The 37 state names, in the order the picker shows them. */
export const NG_STATE_NAMES: string[] = NG_STATES_LIST.map((s) => s.name);

/**
 * Legacy spellings still present in saved addresses. Storage is untrusted and
 * predates this file: `lib/delivery.ts` called the FCT "FCT - Abuja", so a row
 * written before this change must resolve rather than be dropped.
 */
export const STATE_NAME_ALIASES: Record<string, string> = {
  "FCT - Abuja": "Federal Capital Territory",
  FCT: "Federal Capital Territory",
  Abuja: "Federal Capital Territory",
};

/** Map any stored or typed state label onto this file's canonical name. */
export function resolveStateName(name: string): string {
  const trimmed = name.trim();
  if (STATE_INDEX.has(slug(trimmed))) {
    return STATE_INDEX.get(slug(trimmed))!.name;
  }
  return STATE_NAME_ALIASES[trimmed] ?? trimmed;
}

export function getState(stateId: string): NgState | undefined {
  return STATE_INDEX.get(stateId);
}

export function getStateByName(name: string): NgState | undefined {
  return STATE_INDEX.get(slug(resolveStateName(name)));
}

export function getLga(id: string): NgLga | undefined {
  return LGA_INDEX.get(id);
}

/** Resolve a `state/lga` pair, refusing an LGA that is not in that state. */
export function getLgaInState(
  stateId: string,
  lgaId: string,
): NgLga | undefined {
  const lga = LGA_INDEX.get(lgaId);
  return lga && lga.stateId === stateId ? lga : undefined;
}

/** The state's label as it should read: the FCT's units are area councils. */
export function lgaLabelFor(state: NgState): string {
  return state.isFct ? "Area council" : "Local government area";
}

/** One-line form used on receipts and address rows. */
export function formatLga(stateName: string, lgaName: string): string {
  return [lgaName, stateName].filter(Boolean).join(", ");
}

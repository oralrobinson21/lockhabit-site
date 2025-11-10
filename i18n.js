/* i18n.js — expanded locale router + strings
   Locales: en, es, pt, fr, de, ar, ru, ja, ko, tr, th, vi, id, hi, zh
   Drop-in replacement. Pages using LHi18n.t() keep working.
*/
(function (global) {
  const STR = {
    en:{app_title:"Income & Taxes",hero_sub:"Fast, private, accurate estimates. No sign-up.",
      gross_income:"Gross Income",pay_cycle:"Pay Cycle",annual:"Annual",monthly:"Monthly",biweekly:"Bi-Weekly",weekly:"Weekly",
      fed_tax:"Federal Tax",state_tax:"State/Local Tax",social_tax:"Social/Payroll",other_deductions:"Other Deductions",
      currency:"Currency",country:"Country",calculate:"Calculate",results:"Results",take_home:"Take-Home",total_tax:"Total Tax",
      breakdown:"Breakdown",federal:"Federal",state:"State/Local",social:"Social/Payroll",other:"Other",
      note_demo:"Rates are editable placeholders. Verify with local guidance.",switch_calc:"Other calculators"},
    es:{app_title:"Ingresos e Impuestos",hero_sub:"Estimaciones rápidas y privadas. Sin registro.",
      gross_income:"Ingreso bruto",pay_cycle:"Ciclo de pago",annual:"Anual",monthly:"Mensual",biweekly:"Quincenal",weekly:"Semanal",
      fed_tax:"Impuesto nacional",state_tax:"Impuesto estatal/local",social_tax:"Seguridad social/Nómina",other_deductions:"Otras deducciones",
      currency:"Moneda",country:"País",calculate:"Calcular",results:"Resultados",take_home:"Ingreso neto",total_tax:"Impuesto total",
      breakdown:"Desglose",federal:"Nacional",state:"Estatal/Local",social:"Seg. social/Nómina",other:"Otros",
      note_demo:"Las tasas son de ejemplo y editables. Verifique localmente.",switch_calc:"Otros calculadores"},
    pt:{app_title:"Renda e Impostos",hero_sub:"Estimativas rápidas e privadas. Sem cadastro.",
      gross_income:"Renda bruta",pay_cycle:"Período de pagamento",annual:"Anual",monthly:"Mensal",biweekly:"Quinzenal",weekly:"Semanal",
      fed_tax:"Imposto federal",state_tax:"Imposto estadual/local",social_tax:"Previdência/folha",other_deductions:"Outras deduções",
      currency:"Moeda",country:"País",calculate:"Calcular",results:"Resultados",take_home:"Líquido",total_tax:"Imposto total",
      breakdown:"Detalhamento",federal:"Federal",state:"Estadual/Local",social:"Previdência/Folha",other:"Outros",
      note_demo:"Taxas são exemplos editáveis. Verifique localmente.",switch_calc:"Outras calculadoras"},
    fr:{app_title:"Revenus & Impôts",hero_sub:"Estimations rapides et privées. Sans inscription.",
      gross_income:"Revenu brut",pay_cycle:"Période de paie",annual:"Annuel",monthly:"Mensuel",biweekly:"Bimensuel",weekly:"Hebdomadaire",
      fed_tax:"Impôt national",state_tax:"Impôt régional/local",social_tax:"Cotisations sociales",other_deductions:"Autres déductions",
      currency:"Devise",country:"Pays",calculate:"Calculer",results:"Résultats",take_home:"Net à payer",total_tax:"Impôt total",
      breakdown:"Détail",federal:"National",state:"Régional/Local",social:"Social",other:"Autre",
      note_demo:"Taux indicatifs et modifiables. À vérifier localement.",switch_calc:"Autres calculateurs"},
    de:{app_title:"Einkommen & Steuern",hero_sub:"Schnell, privat, ohne Anmeldung.",
      gross_income:"Bruttoeinkommen",pay_cycle:"Zahlungszyklus",annual:"Jährlich",monthly:"Monatlich",biweekly:"14-tägig",weekly:"Wöchentlich",
      fed_tax:"Bundessteuer",state_tax:"Land/Kommune",social_tax:"Sozialabgaben",other_deductions:"Weitere Abzüge",
      currency:"Währung",country:"Land",calculate:"Berechnen",results:"Ergebnisse",take_home:"Netto",total_tax:"Gesamtsteuer",
      breakdown:"Aufschlüsselung",federal:"Bund",state:"Land/Kommune",social:"Sozialabgaben",other:"Sonstige",
      note_demo:"Sätze sind editierbare Platzhalter. Lokal prüfen.",switch_calc:"Weitere Rechner"},
    ar:{app_title:"الدخل والضرائب",hero_sub:"تقديرات سريعة وخاصة. بدون تسجيل.",
      gross_income:"الدخل الإجمالي",pay_cycle:"دورة الدفع",annual:"سنوي",monthly:"شهري",biweekly:"كل أسبوعين",weekly:"أسبوعي",
      fed_tax:"ضريبة مركزية",state_tax:"ضريبة محلية/إقليمية",social_tax:"ضمان اجتماعي/رواتب",other_deductions:"اقتطاعات أخرى",
      currency:"العملة",country:"الدولة",calculate:"احسب",results:"النتائج",take_home:"الصافي",total_tax:"إجمالي الضرائب",
      breakdown:"التقسيم",federal:"مركزية",state:"محلية/إقليمية",social:"اجتماعي/رواتب",other:"أخرى",
      note_demo:"النسب توضيحية وقابلة للتعديل. يُرجى التحقق محليًا.",switch_calc:"حسابات أخرى"},
    ru:{app_title:"Доход и налоги",hero_sub:"Быстрые и приватные расчёты. Без регистрации.",
      gross_income:"Валовой доход",pay_cycle:"Период выплат",annual:"Годовой",monthly:"Ежемесячный",biweekly:"Раз в две недели",weekly:"Еженедельный",
      fed_tax:"Федеральный налог",state_tax:"Региональный/местный",social_tax:"Соцвзносы/пейролл",other_deductions:"Прочие вычеты",
      currency:"Валюта",country:"Страна",calculate:"Рассчитать",results:"Результаты",take_home:"На руки",total_tax:"Всего налогов",
      breakdown:"Структура",federal:"Федеральный",state:"Регион/Местный",social:"Соцвзносы",other:"Другое",
      note_demo:"Ставки примерные и редактируемые. Проверяйте локальные.",switch_calc:"Другие калькуляторы"},
    ja:{app_title:"収入と税金",hero_sub:"高速・プライベート。登録不要。",
      gross_income:"総収入",pay_cycle:"支給サイクル",annual:"年",monthly:"月",biweekly:"隔週",weekly:"週",
      fed_tax:"国税",state_tax:"地方税",social_tax:"社会保険/給与税",other_deductions:"その他控除",
      currency:"通貨",country:"国",calculate:"計算",results:"結果",take_home:"手取り",total_tax:"税額合計",
      breakdown:"内訳",federal:"国税",state:"地方税",social:"社会保険/給与",other:"その他",
      note_demo:"税率は編集可能な例です。各国の規定を確認してください。",switch_calc:"他の計算機"},
    ko:{app_title:"소득 및 세금",hero_sub:"빠르고 개인적인 계산. 가입 불필요.",
      gross_income:"총소득",pay_cycle:"지급 주기",annual:"연",monthly:"월",biweekly:"격주",weekly:"주",
      fed_tax:"국세",state_tax:"지방세",social_tax:"사회/급여세",other_deductions:"기타 공제",
      currency:"통화",country:"국가",calculate:"계산",results:"결과",take_home:"실수령",total_tax:"총 세금",
      breakdown:"구성",federal:"국세",state:"지방세",social:"사회/급여",other:"기타",
      note_demo:"세율은 예시이며 수정 가능. 현지 기준 확인.",switch_calc:"다른 계산기"},
    tr:{app_title:"Gelir ve Vergiler",hero_sub:"Hızlı ve gizli tahminler. Kayıt yok.",
      gross_income:"Brüt gelir",pay_cycle:"Ödeme döngüsü",annual:"Yıllık",monthly:"Aylık",biweekly:"İki haftada bir",weekly:"Haftalık",
      fed_tax:"Merkezi vergi",state_tax:"Eyalet/Yerel vergi",social_tax:"Sosyal/ Bordro",other_deductions:"Diğer kesintiler",
      currency:"Para birimi",country:"Ülke",calculate:"Hesapla",results:"Sonuçlar",take_home:"Elden net",total_tax:"Toplam vergi",
      breakdown:"Dağılım",federal:"Merkezi",state:"Eyalet/Yerel",social:"Sosyal/Bordro",other:"Diğer",
      note_demo:"Oranlar düzenlenebilir örnektir. Yerelde doğrulayın.",switch_calc:"Diğer hesaplayıcılar"},
    th:{app_title:"รายได้และภาษี",hero_sub:"คำนวณรวดเร็ว เป็นส่วนตัว ไม่ต้องสมัคร",
      gross_income:"รายได้รวม",pay_cycle:"รอบจ่ายเงิน",annual:"รายปี",monthly:"รายเดือน",biweekly:"รายปักษ์",weekly:"รายสัปดาห์",
      fed_tax:"ภาษีกลาง",state_tax:"ภาษีท้องถิ่น",social_tax:"ประกันสังคม/ภาษีเงินเดือน",other_deductions:"หักอื่น ๆ",
      currency:"สกุลเงิน",country:"ประเทศ",calculate:"คำนวณ",results:"ผลลัพธ์",take_home:"รับสุทธิ",total_tax:"ภาษีรวม",
      breakdown:"สัดส่วน",federal:"กลาง",state:"ท้องถิ่น",social:"ประกันสังคม",other:"อื่น ๆ",
      note_demo:"อัตราเป็นตัวอย่างแก้ไขได้ ควรตรวจสอบตามพื้นที่.",switch_calc:"เครื่องคำนวณอื่น"},
    vi:{app_title:"Thu nhập & Thuế",hero_sub:"Ước tính nhanh, riêng tư. Không cần đăng ký.",
      gross_income:"Thu nhập gộp",pay_cycle:"Chu kỳ trả lương",annual:"Năm",monthly:"Tháng",biweekly:"Hai tuần",weekly:"Tuần",
      fed_tax:"Thuế trung ương",state_tax:"Thuế địa phương",social_tax:"BHXH/Thuế lương",other_deductions:"Khấu trừ khác",
      currency:"Tiền tệ",country:"Quốc gia",calculate:"Tính",results:"Kết quả",take_home:"Thực lĩnh",total_tax:"Tổng thuế",
      breakdown:"Chi tiết",federal:"Trung ương",state:"Địa phương",social:"BHXH/Lương",other:"Khác",
      note_demo:"Thuế suất chỉ mang tính minh hoạ và có thể chỉnh. Hãy kiểm tra địa phương.",switch_calc:"Máy tính khác"},
    id:{app_title:"Pendapatan & Pajak",hero_sub:"Perkiraan cepat dan privat. Tanpa daftar.",
      gross_income:"Pendapatan kotor",pay_cycle:"Siklus gaji",annual:"Tahunan",monthly:"Bulanan",biweekly:"Dua mingguan",weekly:"Mingguan",
      fed_tax:"Pajak pusat",state_tax:"Pajak daerah/lokal",social_tax:"Jamsos/Pajak gaji",other_deductions:"Potongan lain",
      currency:"Mata uang",country:"Negara",calculate:"Hitung",results:"Hasil",take_home:"Gaji bersih",total_tax:"Total pajak",
      breakdown:"Rincian",federal:"Pusat",state:"Daerah/Lokal",social:"Jamsos/Gaji",other:"Lainnya",
      note_demo:"Tarif bersifat contoh dan dapat diubah. Cek aturan lokal.",switch_calc:"Kalkulator lain"},
    hi:{app_title:"आय और कर",hero_sub:"तेज़, निजी, अनुमानित आँकड़े। साइन-अप नहीं।",
      gross_income:"सकल आय",pay_cycle:"वेतन चक्र",annual:"वार्षिक",monthly:"मासिक",biweekly:"दो-साप्ताहिक",weekly:"साप्ताहिक",
      fed_tax:"केंद्र सरकार कर",state_tax:"राज्य/स्थानीय कर",social_tax:"सामाजिक/पेरोल",other_deductions:"अन्य कटौतियाँ",
      currency:"मुद्रा",country:"देश",calculate:"गणना करें",results:"परिणाम",take_home:"हाथ में आय",total_tax:"कुल कर",
      breakdown:"विभाजन",federal:"केंद्रीय",state:"राज्य/स्थानीय",social:"सामाजिक/पेरोल",other:"अन्य",
      note_demo:"दरें संपादन-योग्य प्लेसहोल्डर हैं। स्थानीय गाइड से जाँचें।",switch_calc:"अन्य कैलकुलेटर"},
    zh:{app_title:"收入与税费",hero_sub:"快速、私密的估算。无需注册。",
      gross_income:"税前收入",pay_cycle:"发薪周期",annual:"年薪",monthly:"月薪",biweekly:"双周",weekly:"周薪",
      fed_tax:"中央税/所得税",state_tax:"地方税/附加",social_tax:"社保/工资税",other_deductions:"其他扣除",
      currency:"货币",country:"国家",calculate:"计算",results:"结果",take_home:"到手收入",total_tax:"税费合计",
      breakdown:"构成",federal:"中央税",state:"地方税",social:"社保/工资",other:"其他",
      note_demo:"税率为可编辑占位。请以当地规则为准。",switch_calc:"更多计算器"},
  };

  // Country → locale
  const LOCALE_BY_COUNTRY = {
    // English default
    US:"en", GB:"en", AU:"en", NZ:"en", CA:"en", IE:"en", SG:"en", ZA:"en",
    // Spanish
    ES:"es", MX:"es", AR:"es", CL:"es", CO:"es", PE:"es", UY:"es", PY:"es", BO:"es", CR:"es", DO:"es", EC:"es", GT:"es", HN:"es", NI:"es", PA:"es", PR:"es", SV:"es",
    // Portuguese
    BR:"pt", PT:"pt", AO:"pt", MZ:"pt",
    // French
    FR:"fr", BE:"fr", CH:"fr", LU:"fr", CA_FR:"fr", MA:"fr", DZ:"fr", TN:"fr", SN:"fr", CI:"fr", CM:"fr",
    // German
    DE:"de", AT:"de", CH_DE:"de",
    // Arabic (RTL)
    AE:"ar", SA:"ar", QA:"ar", KW:"ar", BH:"ar", OM:"ar", EG:"ar", MA_AR:"ar", DZ_AR:"ar",
    // Russian
    RU:"ru", KZ:"ru", BY:"ru",
    // East Asia
    CN:"zh", TW:"zh", HK:"zh", JP:"ja", KR:"ko",
    // SE Asia
    TH:"th", VN:"vi", ID:"id", MY:"en", PH:"en",
    // South Asia
    IN:"hi", PK:"en", BD:"en", LK:"en",
    // Türkiye
    TR:"tr"
  };

  function detectCountry() {
    const saved = localStorage.getItem("lh.country");
    if (saved) return saved.replace(/"/g,"");
    const lang = (navigator.language || "en-US");
    const parts = lang.split("-");
    const cc = (parts[1]||"US").toUpperCase();
    return cc;
  }

  function detectLocale(country) {
    // special-case Canadian French and Swiss German/French if navigator.language provides it
    const nav = (navigator.language || "").toLowerCase();
    if (country==="CA" && nav.startsWith("fr")) return "fr";
    if (country==="CH" && nav.startsWith("de")) return "de";
    if (country==="CH" && nav.startsWith("fr")) return "fr";
    return LOCALE_BY_COUNTRY[country] || "en";
  }

  function t(key) {
    const cc = detectCountry();
    const loc = detectLocale(cc);
    const pack = STR[loc] || STR.en;
    return pack[key] || STR.en[key] || key;
  }

  // RTL support (Arabic)
  (function applyDir(){
    const cc = detectCountry();
    const loc = detectLocale(cc);
    const rtl = (loc === "ar");
    const el = document.documentElement;
    el.setAttribute("lang", loc);
    el.setAttribute("dir", rtl ? "rtl" : "ltr");
  })();

  global.LHi18n = { t, detectCountry, detectLocale, STR };
})(window);
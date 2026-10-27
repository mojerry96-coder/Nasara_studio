/* All site content lives here. Empty strings are hidden on the site, so nothing half-finished shows to visitors. */
window.NASARA_CONFIG = (() => {
  const ill = s => `media/ill/${s}.jpg`;
  const d3 = s => `media/3d/${s}.jpg`;
  const film = (s, label = '') => ({ src: `media/video/${s}.mp4`, poster: `media/poster/${s}.jpg`, label });
  /* Hero slides: an image or a film, plus the portfolio work it links to. */
  const still = (src, work) => ({ src, work });
  const moving = (s, work, start = 0) => ({ film: { ...film(s), start }, work });

  return {
    currency: 'NGN',
    locale: 'en-NG',

    /* Contact & social: fill these in; each link appears only once it has a value. */
    contact: {
      email: 'nasarastudios@gmail.com',
      instagram: 'https://www.instagram.com/nasara_studios/',
      whatsapp: '2349054183990',   // international format, digits only
      store: ''         // full URL of the online store
    },
    /* Your own server routes. Until they exist, forms fall back to email/WhatsApp so enquiries still reach you. */
    endpoints: { lead: '', enquiry: '' },
    sampleUrl: '',      // link to the free book sample (PDF); shown right after someone asks for it
    policies: { refund: '', terms: '', privacy: '' },  // URLs; shown in the footer once set

    heroes: {
      /* Home hero: three panels that crossfade in a staggered cascade (one panel on phones). */
      home: [
        [still(d3('black-gown-1-1-1'), 'black-gown'), moving('ai-cjikmgghqayaaaaacoammq-0-raw-video-2', 'black-gown'), still(d3('intro-gown-2'), 'intro-gown'), still(d3('another-white-5'), 'white-ruffle')],
        [moving('ai-hf-20260724-200114-4499bc40-1086-4183-a9e9-80cbd', 'bronze-petal', 3.5), moving('ai-hf-20260722-143520-0fd78dec-41d4-48dd-b25e-d434a', 'terracotta-coat'), still(d3('design-1-1'), 'gold-structure'), moving('ai-cjhdawgu7gaaaaaab7ifag-0-raw-video-2', 'print-to-motion')],
        [still(d3('courthouse-dress-1'), 'courthouse-dress'), moving('corset-0', 'corset'), still(d3('neww-colorway-0-copy-3-1-3'), 'monochrome-line'), still(d3('style-connosseur-1'), 'style-connoisseur')]
      ],
      course3d: [
        moving('woven-loom', 'woven-loom'),
        moving('corset-0', 'corset'),
        moving('black-gown', 'black-gown'),
        still(d3('style-connosseur-1'), 'style-connoisseur'),
        moving('another-white', 'white-ruffle')
      ],
      courseAi: [
        moving('ai-chghtggj1ngaaaaabgk0rq-0-raw-video-2', 'denim-volume'),
        moving('ai-hf-20260722-143520-0fd78dec-41d4-48dd-b25e-d434a', 'terracotta-coat'),
        moving('ai-hf-20260724-200114-4499bc40-1086-4183-a9e9-80cbd', 'bronze-petal'),
        moving('ai-chghtggj1ngaaaaaaw5tvw-0-raw-video-2-2', 'petal-bloom')
      ],
      book: [
        still(ill('20260207-111436'), 'couture-gowns'),
        still(ill('20260207-111530'), 'couture-gowns'),
        still(ill('20260207-111443'), 'couture-gowns'),
        still(ill('20260207-111514'), 'couture-gowns'),
        still(ill('white-silk-abaya-fashion-illustr-202608271417'), 'ivory-silk')
      ],
      mentorship: [
        still(ill('peach-silk-runway-outfit-design-202608271231'), 'peach-silk'),
        still(ill('designing-lilac-silk-fashion-outfit-202608271420-3'), 'lilac-silk'),
        still(d3('intro-gown-1'), 'intro-gown'),
        still(ill('designing-modern-white-silk-abaya-202608271417'), 'ivory-silk')
      ],
      hire: [
        still(ill('designing-modern-white-silk-abaya-202608271417'), 'ivory-silk'),
        moving('neww', 'monochrome-line'),
        still(d3('courthouse-dress-1'), 'courthouse-dress'),
        still(ill('chatgpt-image-feb-18-2026-07-37-23-am'), 'statement'),
        moving('oziks-work-red', 'wilo-red')
      ]
    },

    products: {
      'course-3d': {
        title: '3D Fashion Design', kind: 'Online course', price: 150000,
        buyUrl: 'https://selar.com/11041093u7',   // Enrol goes straight to the Selar checkout
        image: d3('style-connosseur-1'), hover: film('woven-loom'),
        description: 'Design, fit and present garments in three dimensions.',
        overview: 'Learn to build garments in 3D, from the first pattern to a finished turntable film you can show clients and collaborators.',
        learn: ['Building garments from 2D patterns', 'Fabric, fit and simulation', 'Styling, lighting and scenes', 'Rendering stills and turntable films', 'Presenting a 3D collection'],
        audience: 'Designers, illustrators and fashion students who want to prototype and present collections digitally.',
        access: '',
        preview: film('vid-3')
      },
      'course-ai': {
        title: 'AI Fashion Film', kind: 'Online course', price: 120000,
        buyUrl: '',
        image: 'media/poster/ai-woman-smiling-and-walking-forward-202607212317-3.jpg', hover: film('ai-hf-20260722-143520-0fd78dec-41d4-48dd-b25e-d434a'),
        description: 'Develop fashion concepts with AI, from still to motion.',
        overview: 'Use AI-assisted tools to develop fashion ideas with intent, keep a garment consistent across images, and bring your illustrations into motion.',
        learn: ['Briefing and prompting for fashion concepts', 'Keeping a character and garment consistent', 'Refining fabric, colour and silhouette', 'Turning illustrations into moving image', 'Building an AI fashion portfolio'],
        audience: 'Illustrators, designers and creatives who want a faster way to explore and present ideas.',
        access: '',
        preview: film('ai-hf-20260722-143520-0fd78dec-41d4-48dd-b25e-d434a')
      },
      book: {
        title: 'Fashion Illustration', kind: 'Book', price: 50000,
        buyUrl: '',
        image: ill('20260207-111436'),
        description: 'A companion for your drawing practice.',
        overview: 'A visual guide to fashion illustration: figure, drape, texture and detail, drawn from the studio’s own collections.',
        format: '',
        pages: [ill('20260207-111436'), ill('20260207-111530'), ill('20260207-111443'), ill('20260207-111514'), ill('designing-lilac-silk-fashion-outfit-202608271420'), ill('white-silk-abaya-fashion-illustr-202608271417')]
      }
    },
    mentorshipCard: { image: ill('peach-silk-runway-outfit-design-202608271231'), description: 'One-to-one guidance for your practice and portfolio.' },

    /* Portfolio. kind: Illustration | 3D | AI. Titles are working names, rename freely. */
    works: [
      { id: 'couture-gowns', title: 'Couture gown studies', kind: 'Illustration',
        images: ['20260207-111436', '20260207-111424', '20260207-111429', '20260207-111432', '20260207-111443', '20260207-111447', '20260207-111451', '20260207-111455', '20260207-111458', '20260207-111502', '20260207-111506', '20260207-111509', '20260207-111514', '20260207-111520', '20260207-111523', '20260207-111526', '20260207-111530', '20260207-111533', '20260207-111537', '20260207-111440'].map(ill) },
      { id: 'black-gown', title: 'Black gown', kind: '3D',
        images: [d3('black-gown-1-1-1')], films: [film('black-gown', 'Turntable'), film('ai-cjikmgghqayaaaaacoammq-0-raw-video-2', 'In motion')] },
      { id: 'terracotta-coat', title: 'Terracotta coat', kind: 'AI',
        films: [film('ai-woman-smiling-and-walking-forward-202607212317-3', 'Front'), film('ai-hf-20260722-143520-0fd78dec-41d4-48dd-b25e-d434a', 'Walk'), film('ai-hf-20260722-140534-d546e2a2-28d1-46d2-8963-a16ec', 'Doorway')] },
      { id: 'lilac-silk', title: 'Lilac silk', kind: 'Illustration',
        images: ['designing-lilac-silk-fashion-outfit-202608271420', 'designing-lilac-silk-fashion-outfit-202608271420-3', 'designer-creating-lilac-silk-outfit-202608271420', 'designing-lilac-silk-abaya-outfit-202609021115', 'fashion-designer-creating-silk-o-202608271229', 'fashion-designer-creating-silk-o-202608271420'].map(ill) },
      { id: 'corset', title: 'Corset study', kind: '3D',
        images: ['corset-custom-view-6', 'corset-custom-view-7', 'corset-custom-view-2-1', 'corset-custom-view-4', 'corset-custom-view-5'].map(d3),
        films: [film('corset-0', 'Turntable'), film('viddd', 'Full look'), film('vuida', 'Construction'), film('turn', 'Profile')] },
      { id: 'cobalt-polka', title: 'Cobalt polka', kind: 'AI',
        films: [film('ai-hf-20260724-160944-531b5317-4d74-4a0d-9d58-8758a', 'Full length'), film('ai-hf-20260724-162258-c296f1c9-d997-4a28-a705-2c18b', 'Portrait')] },
      { id: 'gold-structure', title: 'Gold structure', kind: '3D',
        images: ['design-1-1', 'design-1-2-3', 'design-1-2-2'].map(d3), films: [film('design-13', 'Detail')] },
      { id: 'ivory-silk', title: 'Ivory silk', kind: 'Illustration',
        images: ['designing-modern-white-silk-abaya-202608271417', 'white-silk-abaya-fashion-illustr-202608271417', 'designer-creating-white-silk-outfit-202608271216', 'designing-lilac-silk-abaya-outfit-202608271420-1', 'designing-white-silk-abaya-outfit-202608271418', 'designing-white-silk-abaya-outfit-202608271419', 'fashion-designer-creating-white-202608271417'].map(ill) },
      { id: 'intro-gown', title: 'Intro gown', kind: '3D', images: ['intro-gown-1', 'intro-gown-2', 'intro-gown-3'].map(d3) },
      { id: 'denim-volume', title: 'Denim volume', kind: '3D',
        images: ['gownn-1', 'gownn-1-2', 'gownn-2-2'].map(d3), films: [film('ai-chghtggj1ngaaaaabgk0rq-0-raw-video-2', 'In motion')] },
      { id: 'petal-bloom', title: 'Petal bloom', kind: 'AI', films: [film('ai-chghtggj1ngaaaaaaw5tvw-0-raw-video-2-2', 'Runway')] },
      { id: 'white-ruffle', title: 'White ruffle', kind: '3D',
        images: ['another-white-2', 'another-white-5'].map(d3), films: [film('another-white', 'Turntable')] },
      { id: 'peach-silk', title: 'Peach silk', kind: 'Illustration',
        images: ['peach-silk-runway-outfit-design-202608271231', 'silk-outfit-runway-illustration-202608271231', 'lilac-silk-fashion-design-illust-202608271428', 'designing-peach-silk-outfit-202608271428'].map(ill) },
      { id: 'wilo-red', title: 'Wilo racing red', kind: '3D',
        images: ['oziks-work-red-1-2', 'oziks-work-red-3', 'oziks-work-red-4', 'oziks-work-red-5'].map(d3), films: [film('oziks-work-red', 'Film')] },
      { id: 'bronze-petal', title: 'Bronze petal', kind: 'AI', films: [film('ai-hf-20260724-200114-4499bc40-1086-4183-a9e9-80cbd', 'Portrait')] },
      { id: 'leather-drape', title: 'Leather drape', kind: '3D', images: ['new-dress-1', 'new-dress-2', 'new-dress-1-2', 'new-dress-2-2'].map(d3) },
      { id: 'menswear', title: 'Menswear shirts', kind: 'Illustration',
        images: ['creative-laidback-irregular-202604081024-1', 'creative-laidback-irregular-202604081024', 'creative-laidback-irregular-202604081024-2', 'creative-laidback-irregular-202604081025', 'creative-male-shirts-202604081024', 'creative-male-shirts-202604081025'].map(ill) },
      { id: 'monochrome-line', title: 'Monochrome line', kind: '3D',
        images: ['neww-colorway-0-copy-3-1-3', 'neww-colorway-0-copy-3-1-2'].map(d3), films: [film('neww', 'Turntable')] },
      { id: 'urban-grey', title: 'Urban grey', kind: 'AI', films: [film('ai-hf-20260724-172708-ddfdb52b-cb70-4fa5-80ee-0d168', 'Film')] },
      { id: 'courthouse-dress', title: 'Courthouse dress', kind: '3D', images: ['courthouse-dress-1', 'courthouse-dress-1-4', 'courthouse-dress-1-2'].map(d3) },
      { id: 'statement', title: 'Statement pieces', kind: 'Illustration',
        images: ['chatgpt-image-feb-18-2026-07-37-23-am', 'creative-lace-dinner-dress-design-202607281310', '432978951700466430-jpeg-202607132329', '621004236160761647', '690176711700917935', '690176711700917935-jpeg-202605311937', '690176711700917935-jpeg-202605311937-1', 'designer-creating-organza-dress-202608261236', '492229434295871446', 'whisk-b93e4b232cd21afb53347ab9325efd52dr-jpeg-202604071050'].map(ill) },
      { id: 'woven-loom', title: 'Woven loom', kind: '3D',
        films: [film('woven-loom', 'Studio'), film('woven-loom-part-vid-two', 'Runway'), film('woven-loom-part-ffsfretwo', 'Runway II')] },
      { id: 'print-to-motion', title: 'Illustration to motion', kind: 'AI', films: [film('ai-cjhdawgu7gaaaaaab7ifag-0-raw-video-2', 'Film')] },
      { id: 'tiered-navy', title: 'Tiered navy', kind: '3D',
        images: ['composite', 'layer-z1-take-away-the-texrt-that-says-created-by-style', 'layer-z1-take-out-the-text-that-says-created-by-style-3d'].map(d3) },
      { id: 'ethereal', title: 'Ethereal', kind: '3D', films: [film('5-ethreal', 'Film')] },
      { id: 'style-connoisseur', title: 'Style connoisseur', kind: '3D', images: ['style-connosseur-1', 'style-connosseur-1-2', 'style-connosseur-1-3'].map(d3) },
      { id: 'ruffle-street', title: 'Ruffle street', kind: 'AI', films: [film('ai-chghtggj1ngaaaaab-p8ng-0-raw-video-2-1', 'Film'), film('ai-cjiky2ghpbcaaaaadgj8bw-0-raw-video-2', 'Seated')] },
      { id: 'val-dress', title: 'Val dress', kind: '3D', films: [film('val-dress', 'Film')] },
      { id: 'wilo-green', title: 'Wilo racing green', kind: '3D',
        images: ['oziks-work-feamale-colorways-0-1', 'oziks-work-feamale-colorways-0-2-2'].map(d3), films: [film('oziks-work-feamale', 'Film')] },
      { id: 'organza-sleeve', title: 'Organza sleeve', kind: '3D', films: [film('i-no-send-your-daddy', 'Turntable'), film('girl', 'Floral mini')] },
      { id: 'portraits', title: 'Beauty portraits', kind: 'AI',
        films: [film('ai-chghtggj1ngaaaaab-n-ba-0-raw-video-2', 'Portrait'), film('ai-balenciaga-campaign-video-creation', 'Campaign'), film('ai-beauty-portrait-video-generation-request', 'Beauty'), film('ai-whisk-cauajgewytfhotk0lwu1yzitndu1nc05ogq4ltr', 'Motion')] },
      { id: 'street-edit', title: 'Street edit', kind: '3D',
        images: ['undefined-5', 'untitled-4', 'undefined-25'].map(d3),
        films: [film('0000-0415', 'Wave suit'), film('untitled', 'Plaid jumpsuit'), film('yasss2', 'Line suit'), film('0000-0817', 'Field drape')] },
      { id: 'abaya-gold', title: 'Abaya', kind: '3D', films: [film('abaya', 'Film')] },
      { id: 'details', title: 'Fabric & detail', kind: '3D',
        films: [film('finak', 'Pearl bodice'), film('aha', 'Knit'), film('female-t-shirt', 'Fringe set'), film('for-hakeeb', 'Graphic tee')] }
    ]
  };
})();

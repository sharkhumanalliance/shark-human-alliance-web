export type Locale = "en" | "es" | "zh";

export const localeNames: Record<Locale, string> = {
  en: "EN",
  es: "ES",
  zh: "中文",
};

type Dictionary = {
  nav: {
    howItWorks: string;
    about: string;
    membership: string;
    blog: string;
    quiz: string;
    wallOfFriends: string;
    mission: string;
    faq: string;
    joinAlliance: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    note: string;
  };
  howItWorks: {
    label: string;
    title: string;
    subtitle: string;
    steps: { title: string; text: string }[];
  };
  about: {
    label: string;
    title: string;
    p1: string;
    p2: string;
    certLabel: string;
    certTitle: string;
    certBody: string;
    certName: string;
    certRecog: string;
  };
  membership: {
    label: string;
    title: string;
    basic: string;
    protected: string;
    nonsnack: string;
  };
  mission: {
    label: string;
    title: string;
    subtitle: string;
    splitTitle: string;
    splitSubtitle: string;
    forSharks: string;
    forSharksDesc: string;
    forHumans: string;
    forHumansDesc: string;
    transparencyTitle: string;
    transparencyDesc: string;
    orgsLabel: string;
    orgsDesc: string;
    disclaimerLabel: string;
    disclaimerText: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  faq: {
    label: string;
    title: string;
  };
  blog: {
    label: string;
    title: string;
    subtitle: string;
    readMore: string;
    backToBlog: string;
    funFact: string;
    by: string;
  };
  quiz: {
    label: string;
    title: string;
    subtitle: string;
    start: string;
    next: string;
    questionOf: string;
    yourResult: string;
    spiritShark: string;
    recommendedTier: string;
    getCertificate: string;
    retake: string;
  };
  wall: {
    label: string;
    title: string;
    subtitle: string;
    joinNote: string;
    memberSince: string;
    status: string;
  };
  footer: {
    description: string;
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    nav: {
      howItWorks: "How it works",
      about: "About",
      membership: "Membership",
      blog: "Alliance Blog",
      quiz: "Quiz",
      wallOfFriends: "Wall of Friends",
      mission: "Real Impact",
      faq: "FAQ",
      joinAlliance: "Join the Alliance",
    },
    hero: {
      badge: "Officially fictional. Socially important.",
      title: "Sharks deserve better PR.",
      subtitle:
        "A fictional alliance helping humans and sharks build better relations — through friendship, diplomacy, and significantly reduced human snacking.",
      ctaPrimary: "Join the Alliance",
      ctaSecondary: "Learn the mission",
      note: "Includes a personalized certificate. Entirely symbolic. Deeply appreciated by sharks.",
    },
    howItWorks: {
      label: "How it works",
      title: "Fast, symbolic and surprisingly official.",
      subtitle:
        "The concept is simple: join the alliance, receive your certificate, and enjoy a measurable improvement in diplomatic shark vibes.",
      steps: [
        {
          title: "Join the Alliance",
          text: "Become an official supporter of peaceful shark-human relations.",
        },
        {
          title: "Receive your certificate",
          text: "Get a personalized Shark Human Alliance membership certificate.",
        },
        {
          title: "Enjoy improved relations",
          text: "Feel slightly safer knowing sharks may now view you as a friend. Symbolically.",
        },
      ],
    },
    about: {
      label: "About the alliance",
      title: "A fictional idea with a very clear point.",
      p1: "Shark Human Alliance is a playful fictional world in which sharks actively work on their public image and advocate for better relations with humans.",
      p2: "The tone is humorous, but the goal is real: turn fear into curiosity, and make sharks feel less like monsters and more like misunderstood ocean neighbors with a branding problem.",
      certLabel: "Certificate preview",
      certTitle: "Certificate of Alliance Membership",
      certBody: "This certifies that",
      certName: "[ Your Name Here ]",
      certRecog:
        "is officially recognized by the Shark Human Alliance as a supporter of peaceful shark-human relations.",
    },
    membership: {
      label: "Membership options",
      title: "Choose your level of shark diplomacy.",
      basic: "Basic Membership",
      protected: "Protected Friend Status",
      nonsnack: "Non-Snack Recognition",
    },
    mission: {
      label: "Real Impact",
      title: "Funny certificate. Real conservation.",
      subtitle:
        "Every certificate sold directly funds real ocean and shark conservation. The joke is fictional. The impact is not.",
      splitTitle: "Where your money actually goes",
      splitSubtitle:
        "We believe in radical transparency. Also, we believe sharks deserve at least 50% of everything.",
      forSharks: "50% — For the sharks (for real)",
      forSharksDesc:
        "Half of every certificate sale goes directly to verified ocean and shark conservation organizations. No middlemen, no vague promises, no \"administrative fees\" that mysteriously eat the budget like a tiger shark eating a surfboard.",
      forHumans: "50% — For the human who built this",
      forHumansDesc:
        "The other half keeps the lights on, the servers running, and the Alliance founder fed. Because while sharks eat fish, humans unfortunately require rent, coffee, and the occasional non-symbolic meal. Think of it as funding the Alliance's land-based operations department (staff: one very tired person).",
      transparencyTitle: "Full transparency",
      transparencyDesc:
        "We publish quarterly reports showing exactly how much was donated and to which organizations. If a shark could read a spreadsheet, they would approve.",
      orgsLabel: "Conservation partners",
      orgsDesc:
        "We work with established organizations dedicated to shark conservation, marine habitat protection, and ocean research. Specific partner announcements coming soon — we're currently negotiating which organizations are willing to accept donations from a fictional shark alliance. Most are surprisingly open to it.",
      disclaimerLabel: "Legal clarity",
      disclaimerText:
        "The Shark Human Alliance is a fictional entertainment brand. The conservation donations are real and verifiable. Your certificate does not protect you from actual sharks. It does, however, help protect actual sharks from us.",
      ctaPrimary: "Get a certificate, save a shark",
      ctaSecondary: "See membership tiers",
    },
    faq: {
      label: "FAQ",
      title: "Clarifications for sensible humans.",
    },
    blog: {
      label: "Alliance Press Room",
      title: "Official dispatches from the deep.",
      subtitle:
        "Press releases, diplomatic statements, and entirely serious journalism from the Alliance's ambassador team.",
      readMore: "Read full dispatch",
      backToBlog: "Back to all dispatches",
      funFact: "Educational sidebar",
      by: "by",
    },
    quiz: {
      label: "Personality Quiz",
      title: "What kind of shark friend are you?",
      subtitle:
        "Answer 5 quick questions and discover your shark diplomacy profile — plus which membership tier suits you best.",
      start: "Start the quiz",
      next: "Next question",
      questionOf: "of",
      yourResult: "Your result",
      spiritShark: "Spirit shark",
      recommendedTier: "Recommended membership",
      getCertificate: "Get your certificate",
      retake: "Retake quiz",
    },
    wall: {
      label: "Wall of Friends",
      title: "Officially recognized by sharks.",
      subtitle:
        "These brave humans have joined the Alliance and earned their place on the wall. Their symbolic protection status is noted. Their bravery is appreciated.",
      joinNote: "Want to see your name here? Join the Alliance and become part of the wall.",
      memberSince: "Member since",
      status: "Status",
    },
    footer: {
      description: "A fictional alliance for better shark-human relations. 50% of every sale funds real ocean conservation.",
    },
  },
  es: {
    nav: {
      howItWorks: "Cómo funciona",
      about: "Acerca de",
      membership: "Membresía",
      blog: "Blog de la Alianza",
      quiz: "Quiz",
      wallOfFriends: "Muro de Amigos",
      mission: "Impacto Real",
      faq: "Preguntas frecuentes",
      joinAlliance: "Únete a la Alianza",
    },
    hero: {
      badge: "Oficialmente ficticia. Socialmente importante.",
      title: "Los tiburones merecen mejor PR.",
      subtitle:
        "Una alianza ficticia que ayuda a humanos y tiburones a construir mejores relaciones — a través de la amistad, la diplomacia y una reducción significativa del picoteo humano.",
      ctaPrimary: "Únete a la Alianza",
      ctaSecondary: "Conoce la misión",
      note: "Incluye un certificado personalizado. Totalmente simbólico. Profundamente apreciado por los tiburones.",
    },
    howItWorks: {
      label: "Cómo funciona",
      title: "Rápido, simbólico y sorprendentemente oficial.",
      subtitle:
        "El concepto es simple: únete a la alianza, recibe tu certificado y disfruta de una mejora medible en las vibraciones diplomáticas tiburonescas.",
      steps: [
        {
          title: "Únete a la Alianza",
          text: "Conviértete en un partidario oficial de las relaciones pacíficas entre tiburones y humanos.",
        },
        {
          title: "Recibe tu certificado",
          text: "Obtén un certificado personalizado de membresía en la Shark Human Alliance.",
        },
        {
          title: "Disfruta de mejores relaciones",
          text: "Siéntete ligeramente más seguro sabiendo que los tiburones pueden verte como amigo. Simbólicamente.",
        },
      ],
    },
    about: {
      label: "Sobre la alianza",
      title: "Una idea ficticia con un punto muy claro.",
      p1: "Shark Human Alliance es un mundo ficticio y juguetón en el que los tiburones trabajan activamente en su imagen pública y abogan por mejores relaciones con los humanos.",
      p2: "El tono es humorístico, pero el objetivo es real: convertir el miedo en curiosidad y hacer que los tiburones se sientan menos como monstruos y más como vecinos oceánicos incomprendidos con un problema de marca.",
      certLabel: "Vista previa del certificado",
      certTitle: "Certificado de Membresía de la Alianza",
      certBody: "Esto certifica que",
      certName: "[ Tu Nombre Aquí ]",
      certRecog:
        "es oficialmente reconocido/a por la Shark Human Alliance como partidario/a de las relaciones pacíficas entre tiburones y humanos.",
    },
    membership: {
      label: "Opciones de membresía",
      title: "Elige tu nivel de diplomacia tiburonesca.",
      basic: "Membresía Básica",
      protected: "Estado de Amigo Protegido",
      nonsnack: "Reconocimiento de No-Merienda",
    },
    mission: {
      label: "Impacto Real",
      title: "Certificado divertido. Conservación real.",
      subtitle:
        "Cada certificado vendido financia directamente la conservación real de océanos y tiburones. La broma es ficticia. El impacto no lo es.",
      splitTitle: "A dónde va realmente tu dinero",
      splitSubtitle:
        "Creemos en la transparencia radical. También creemos que los tiburones merecen al menos el 50% de todo.",
      forSharks: "50% — Para los tiburones (de verdad)",
      forSharksDesc:
        "La mitad de cada venta de certificados va directamente a organizaciones verificadas de conservación de océanos y tiburones. Sin intermediarios, sin promesas vagas, sin \"gastos administrativos\" que misteriosamente se comen el presupuesto como un tiburón tigre comiéndose una tabla de surf.",
      forHumans: "50% — Para el humano que construyó esto",
      forHumansDesc:
        "La otra mitad mantiene las luces encendidas, los servidores funcionando y al fundador de la Alianza alimentado. Porque mientras los tiburones comen pescado, los humanos desafortunadamente necesitan alquiler, café y alguna comida no simbólica ocasional. Piénsalo como financiar el departamento de operaciones terrestres de la Alianza (personal: una persona muy cansada).",
      transparencyTitle: "Transparencia total",
      transparencyDesc:
        "Publicamos informes trimestrales que muestran exactamente cuánto se donó y a qué organizaciones. Si un tiburón pudiera leer una hoja de cálculo, lo aprobaría.",
      orgsLabel: "Socios de conservación",
      orgsDesc:
        "Trabajamos con organizaciones establecidas dedicadas a la conservación de tiburones, la protección del hábitat marino y la investigación oceánica. Anuncios específicos de socios próximamente — actualmente estamos negociando qué organizaciones están dispuestas a aceptar donaciones de una alianza ficticia de tiburones.",
      disclaimerLabel: "Claridad legal",
      disclaimerText:
        "La Shark Human Alliance es una marca de entretenimiento ficticia. Las donaciones para conservación son reales y verificables. Tu certificado no te protege de tiburones reales. Sin embargo, sí ayuda a proteger a los tiburones reales de nosotros.",
      ctaPrimary: "Compra un certificado, salva un tiburón",
      ctaSecondary: "Ver niveles de membresía",
    },
    faq: {
      label: "Preguntas frecuentes",
      title: "Aclaraciones para humanos sensatos.",
    },
    blog: {
      label: "Sala de Prensa de la Alianza",
      title: "Despachos oficiales desde las profundidades.",
      subtitle:
        "Comunicados de prensa, declaraciones diplomáticas y periodismo absolutamente serio del equipo de embajadores de la Alianza.",
      readMore: "Leer despacho completo",
      backToBlog: "Volver a todos los despachos",
      funFact: "Dato educativo",
      by: "por",
    },
    quiz: {
      label: "Quiz de Personalidad",
      title: "¿Qué tipo de amigo tiburonesco eres?",
      subtitle:
        "Responde 5 preguntas rápidas y descubre tu perfil diplomático tiburonesco — además de qué nivel de membresía te conviene más.",
      start: "Empezar el quiz",
      next: "Siguiente pregunta",
      questionOf: "de",
      yourResult: "Tu resultado",
      spiritShark: "Tiburón espiritual",
      recommendedTier: "Membresía recomendada",
      getCertificate: "Obtén tu certificado",
      retake: "Repetir quiz",
    },
    wall: {
      label: "Muro de Amigos",
      title: "Oficialmente reconocidos por los tiburones.",
      subtitle:
        "Estos valientes humanos se unieron a la Alianza y ganaron su lugar en el muro. Su estado de protección simbólica está registrado. Su valentía es apreciada.",
      joinNote: "¿Quieres ver tu nombre aquí? Únete a la Alianza y forma parte del muro.",
      memberSince: "Miembro desde",
      status: "Estado",
    },
    footer: {
      description: "Una alianza ficticia para mejores relaciones entre tiburones y humanos. El 50% de cada venta financia conservación marina real.",
    },
  },
  zh: {
    nav: {
      howItWorks: "如何运作",
      about: "关于我们",
      membership: "会员",
      blog: "联盟博客",
      quiz: "测试",
      wallOfFriends: "友谊之墙",
      mission: "真实影响",
      faq: "常见问题",
      joinAlliance: "加入联盟",
    },
    hero: {
      badge: "官方虚构。社会重要。",
      title: "鲨鱼值得更好的公关。",
      subtitle:
        "一个虚构联盟，帮助人类和鲨鱼建立更好的关系——通过友谊、外交，以及大幅减少人类零食事件。",
      ctaPrimary: "加入联盟",
      ctaSecondary: "了解使命",
      note: "包含个性化证书。纯属象征。鲨鱼们深表感谢。",
    },
    howItWorks: {
      label: "如何运作",
      title: "快速、象征性且出乎意料地正式。",
      subtitle:
        "概念很简单：加入联盟，获得证书，享受鲨鱼外交氛围的可衡量改善。",
      steps: [
        {
          title: "加入联盟",
          text: "成为和平鲨鱼-人类关系的官方支持者。",
        },
        {
          title: "获得证书",
          text: "获取个性化的鲨鱼人类联盟会员证书。",
        },
        {
          title: "享受改善的关系",
          text: "感觉更安全一点，因为鲨鱼现在可能视你为朋友。象征性地。",
        },
      ],
    },
    about: {
      label: "关于联盟",
      title: "一个有明确意义的虚构想法。",
      p1: "鲨鱼人类联盟是一个有趣的虚构世界，鲨鱼积极改善自己的公众形象，倡导与人类建立更好的关系。",
      p2: "语调是幽默的，但目标是真实的：将恐惧转化为好奇心，让鲨鱼不再像怪物，而更像是有品牌问题的被误解的海洋邻居。",
      certLabel: "证书预览",
      certTitle: "联盟会员证书",
      certBody: "此证书证明",
      certName: "[ 您的姓名 ]",
      certRecog: "被鲨鱼人类联盟正式承认为和平鲨鱼-人类关系的支持者。",
    },
    membership: {
      label: "会员选项",
      title: "选择您的鲨鱼外交级别。",
      basic: "基础会员",
      protected: "受保护朋友身份",
      nonsnack: "非零食认证",
    },
    mission: {
      label: "真实影响",
      title: "搞笑证书。真实保护。",
      subtitle:
        "每张售出的证书都直接资助真正的海洋和鲨鱼保护。笑话是虚构的。影响是真实的。",
      splitTitle: "您的钱实际去向",
      splitSubtitle:
        "我们相信极端透明。我们也相信鲨鱼至少应该得到所有东西的50%。",
      forSharks: "50% — 给鲨鱼（真的）",
      forSharksDesc:
  "每张证书销售额的一半直接捐给经过验证的海洋和鲨鱼保护组织。没有中间人，没有模糊的承诺，没有像虎鲨吃冲浪板一样神秘消耗预算的“行政费用”。",
      forHumans: "50% — 给建造这一切的人类",
      forHumansDesc:
        "另一半用于维持运营——服务器、电费，以及让联盟创始人有饭吃。因为鲨鱼吃鱼，但人类不幸地需要房租、咖啡和偶尔的非象征性餐食。把这看作资助联盟的陆地运营部门（员工：一个非常疲惫的人）。",
      transparencyTitle: "完全透明",
      transparencyDesc:
        "我们发布季度报告，清楚显示捐了多少以及捐给了哪些组织。如果鲨鱼能读电子表格，它们会批准的。",
      orgsLabel: "保护合作伙伴",
      orgsDesc:
        "我们与致力于鲨鱼保护、海洋栖息地保护和海洋研究的知名组织合作。具体合作伙伴公告即将发布——我们目前正在与愿意接受虚构鲨鱼联盟捐款的组织进行谈判。",
      disclaimerLabel: "法律声明",
      disclaimerText:
        "鲨鱼人类联盟是一个虚构的娱乐品牌。保护捐款是真实且可验证的。您的证书不能保护您免受真正的鲨鱼伤害。但是，它确实有助于保护真正的鲨鱼免受我们的伤害。",
      ctaPrimary: "购买证书，拯救鲨鱼",
      ctaSecondary: "查看会员等级",
    },
    faq: {
      label: "常见问题",
      title: "给理性人类的说明。",
    },
    blog: {
      label: "联盟新闻室",
      title: "来自深海的官方快报。",
      subtitle: "新闻稿、外交声明，以及联盟大使团队绝对严肃的新闻报道。",
      readMore: "阅读完整快报",
      backToBlog: "返回所有快报",
      funFact: "科普角",
      by: "作者",
    },
    quiz: {
      label: "性格测试",
      title: "你是什么类型的鲨鱼朋友？",
      subtitle:
        "回答5个快速问题，发现你的鲨鱼外交档案——以及哪个会员等级最适合你。",
      start: "开始测试",
      next: "下一题",
      questionOf: "/",
      yourResult: "你的结果",
      spiritShark: "灵魂鲨鱼",
      recommendedTier: "推荐会员",
      getCertificate: "获取证书",
      retake: "重新测试",
    },
    wall: {
      label: "友谊之墙",
      title: "被鲨鱼官方认可。",
      subtitle:
        "这些勇敢的人类加入了联盟，赢得了墙上的位置。他们的象征性保护状态已被记录。他们的勇气受到赞赏。",
      joinNote: "想在这里看到你的名字？加入联盟，成为墙的一部分。",
      memberSince: "加入时间",
      status: "状态",
    },
    footer: {
      description: "一个为改善鲨鱼-人类关系而设的虚构联盟。每笔销售的50%资助真正的海洋保护。",
    },
  },
};

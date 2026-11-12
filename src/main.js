import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  // Campaign visual layer: remove data-campaign from <html> to disable it.
  const campaignBanner = document.querySelector('[data-campaign-banner]');
  const campaignBannerClose = document.querySelector('[data-campaign-banner-close]');
  const hasNovemberCampaign = document.documentElement.dataset.campaign === 'novembro-azul';

  if (campaignBanner && hasNovemberCampaign) {
    campaignBanner.hidden = false;
    document.documentElement.classList.remove('campaign-banner-dismissed');
  }

  campaignBannerClose?.addEventListener('click', () => {
    campaignBanner.hidden = true;
    document.documentElement.classList.add('campaign-banner-dismissed');
  });

  // Menu Mobile Toggle
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeMenuBtn = document.getElementById('close-menu-btn');

  if (menuBtn && mobileMenu && closeMenuBtn) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.remove('hidden');
      document.body.style.overflow = 'hidden'; // Previne scroll
      menuBtn.setAttribute('aria-expanded', 'true');
      closeMenuBtn.focus();
    });

    const closeMobileMenu = () => {
      mobileMenu.classList.add('hidden');
      document.body.style.overflow = '';
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.focus();
    };

    closeMenuBtn.addEventListener('click', closeMobileMenu);

    // Fechar menu ao clicar em um link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    document.addEventListener('keydown', (event) => {
      if (mobileMenu.classList.contains('hidden')) return;
      if (event.key === 'Escape') {
        closeMobileMenu();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = [...mobileMenu.querySelectorAll('a[href], button:not([disabled])')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  // Scroll Header Effect
  const header = document.querySelector('header');
  const updateHeader = () => header?.classList.toggle('is-compact', window.scrollY > 32);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  // Intersection Observer para Animações
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-slide-up');
        entry.target.classList.remove('opacity-0', 'translate-y-4'); // Remove classes iniciais
        observer.unobserve(entry.target);
      }
    });
    }, observerOptions);

    animatedElements.forEach(el => {
      el.classList.add('opacity-0', 'translate-y-4', 'transition-all', 'duration-700');
      observer.observe(el);
    });
  } else {
    animatedElements.forEach(el => {
      el.classList.remove('opacity-0', 'translate-y-4');
      el.classList.add('animate-slide-up');
    });
  }

  // Count-up uses the same final visible copy and pauses for reduced motion.
  const counter = document.querySelector('[data-counter-number]');
  if (counter && !prefersReducedMotion && 'IntersectionObserver' in window) {
    const target = Number(counter.dataset.counterNumber);
    const counterObserver = new IntersectionObserver((entries) => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      const duration = 1100;
      const startAt = performance.now();
      const frame = (now) => {
        const progress = Math.min((now - startAt) / duration, 1);
        const value = Math.floor(target * (1 - (1 - progress) ** 3));
        counter.textContent = `+${value}`;
        if (progress < 1) requestAnimationFrame(frame);
        else counter.textContent = `+${target}`;
      };
      requestAnimationFrame(frame);
      counterObserver.disconnect();
    }, { threshold: 0.7 });
    counterObserver.observe(counter);
  }

  // Image Lightbox Modal Logic (Event Delegation para suportar elementos dinâmicos)
  const imageModal = document.getElementById('image-modal');
  const modalContainer = document.getElementById('modal-container');
  const closeModal = document.getElementById('close-modal');
  let modalReturnFocus = null;

  if (imageModal && closeModal) {
    document.body.addEventListener('click', (e) => {
      // Allow clicking the card itself or the image
      const card = e.target.closest('.card-premium');
      const clickableImg = e.target.classList.contains('clickable-image') ? e.target : (card ? card.querySelector('.clickable-image') : null);

      if (clickableImg && !e.target.closest('a')) {
        const id = clickableImg.getAttribute('data-id');
        const p = id !== null ? professionals[id] : null;

        const modalImgDesktop = document.getElementById('modal-img-desktop');
        const modalImgMobile = document.getElementById('modal-img-mobile');

        if (modalImgDesktop) {
          modalImgDesktop.src = clickableImg.src;
          modalImgDesktop.alt = p ? `Foto em alta resolução do(a) profissional ${p.fullName || p.name}` : 'Profissional';
          modalImgDesktop.style.objectPosition = p ? (p.objectPosition || 'center') : 'center';
        }
        if (modalImgMobile) {
          modalImgMobile.src = clickableImg.src;
          modalImgMobile.alt = p ? `Foto em alta resolução do(a) profissional ${p.fullName || p.name}` : 'Profissional';
          modalImgMobile.style.objectPosition = p ? (p.objectPosition || 'center') : 'center';
        }
        
        if (p) {
          const titleEl = document.getElementById('modal-title');
          const subtitleEl = document.getElementById('modal-subtitle');
          const detailsEl = document.getElementById('modal-details');
          
          if (titleEl) titleEl.textContent = p.fullName || p.name;
          if (subtitleEl) subtitleEl.textContent = p.credentials ? `${p.specialty} | ${p.credentials}` : p.specialty;
          if (detailsEl) detailsEl.innerHTML = p.details || `<p class="text-climed-navy text-lg text-center mt-8">Mais informações indisponíveis no momento.</p>`;
          
          const whatsappBtn = document.getElementById('modal-whatsapp-btn');
          if (whatsappBtn) {
            const docName = p.fullName || p.name;
            const docSpecialty = p.specialty || '';
            const message = `Olá! Gostaria de agendar uma consulta com o(a) ${docName} (Especialidade: ${docSpecialty}).`;
            whatsappBtn.href = `https://wa.me/5527997394242?text=${encodeURIComponent(message)}`;
            whatsappBtn.setAttribute('data-ga-medico', docName);
            whatsappBtn.setAttribute('data-ga-especialidade', docSpecialty);
          }
        }

        imageModal.classList.remove('hidden');
        modalReturnFocus = clickableImg;
        closeModal.focus();
        // Trigger animation
        setTimeout(() => {
          imageModal.classList.remove('opacity-0');
          modalContainer.classList.remove('scale-95');
        }, 10);
        document.body.style.overflow = 'hidden';
      }
    });

    const closeLightbox = () => {
      imageModal.classList.add('opacity-0');
      modalContainer.classList.add('scale-95');
      setTimeout(() => {
        imageModal.classList.add('hidden');
        document.body.style.overflow = '';
        modalReturnFocus?.focus();
      }, 300);
    };

    closeModal.addEventListener('click', closeLightbox);
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal || e.target === modalContainer) {
        closeLightbox();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !imageModal.classList.contains('hidden')) {
        closeLightbox();
        return;
      }
      if (e.key === 'Tab' && !imageModal.classList.contains('hidden')) {
        const focusable = [...imageModal.querySelectorAll('button:not([disabled]), a[href]')];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  // -------------------------------------------------------------
  // DADOS E RENDERIZAÇÃO DOS PROFISSIONAIS (17 Médicos + Serviços)
  // -------------------------------------------------------------
  const professionals = [
    { 
      name: "Jaqueline", 
      fullName: "Jaqueline Cordeiro Rocha",
      credentials: "CRFª: 9729-1",
      specialty: "Fonoaudiologia", 
      category: "Fono / Pediatria / Odonto", 
      img: "/jaqueline.webp",
      details: "<ul class='list-disc pl-5 space-y-1 mb-4 text-climed-navy'><li><strong>Graduação em Fonoaudiologia:</strong> FRASCE (Faculdade da ASCE - RJ)</li><li><strong>Especialização em Motricidade Orofacial:</strong> UFRJ</li><li><strong>Especialização em Disfagia Pediátrica e Adulto:</strong> PUC Minas</li><li><strong>Especialização EAD em Disfagia Orofaringea:</strong> Unyleya</li><li><strong>Pós-Graduação em Audiologia Clinica:</strong> UNIGRANRIO-RJ</li><li><strong>Pós-Graduação em Voz:</strong> CEFAC-RJ</li><li><strong>Cursos:</strong> Emissões Otoacústicas (FONOTRADE-RJ), TAN - triagem Auditiva Neonatal (FIOCRUZ), Teste da Linguinha (RJ)</li><li><strong>Atenção à Reabilitação:</strong> Pessoa com Transtorno do Espectro do Autismo (UNA SUS)</li></ul>"
    },
    { 
      name: "Carmelina", 
      fullName: "Carmelina Soares Bonadiman",
      credentials: "CRP 16/2017 ES",
      specialty: "Psicologia", 
      category: "Nutrição / Psicologia", 
      img: "/carmelina.webp",
      details: "<h4 class='font-bold text-climed-navy mt-2 mb-1'>Formação</h4><ul class='list-disc pl-5 space-y-1 mb-4 text-climed-navy'><li>Graduada em Psicologia (UNILINHARES-ES)</li><li>Graduada em Pedagogia (UFES-ES)</li><li>Pós-Graduada em Parapsicologia (CLAP-SP)</li><li>Pós-Graduada em Terapia Familiar Sistêmica (FDV-ES)</li></ul><h4 class='font-bold text-climed-navy mt-4 mb-1'>Terapeuta</h4><ul class='list-disc pl-5 space-y-1 text-climed-navy'><li>De Casal e do Luto</li><li>De EMDR (dessensibilização e reprocessamento de trauma)</li><li>BRAINSPOTTING (psicoterapia neurológica e fisiológica)</li><li>De MATES (Regulação do cérebro)</li></ul>"
    },
    { 
      name: "Juliana", 
      fullName: "Juliana da Silva Cecílio",
      credentials: "CRN 24100373",
      specialty: "Nutrição", 
      category: "Nutrição / Psicologia", 
      img: "/juliana.webp",
      details: "<p class='mb-2 text-climed-navy'>Nutricionista graduada em Nutrição pela Universidade Estácio de Sá – Polo Jardim Camburi, Vitória (ES).</p><p class='text-climed-navy'>Atua com foco em emagrecimento e hipertrofia, desenvolvendo estratégias nutricionais individualizadas com base em evidências científicas.</p>"
    },
    { 
      name: "Giseli", 
      fullName: "Giseli Loss Mattede Sperandio",
      credentials: "CRN 0011569",
      specialty: "Nutrição", 
      category: "Nutrição / Psicologia", 
      img: "/giseli.webp",
      details: "<ul class='list-disc pl-5 space-y-2 text-climed-navy'><li><strong>Graduação em Nutrição:</strong> Universidade Santa Úrsula, RJ</li><li><strong>Pós Graduação em Nutrição Clínica:</strong> Universidade São Camilo RJ</li><li><strong>Pós Graduação em Terapia Nutricional:</strong> EMESCAM</li><li><strong>Pós Graduação:</strong> Nutrição em Obesidade, Cirurgia Metabólica e Bariátrica.</li></ul>"
    },
    { 
      name: "Dr. Márcio Piske", 
      fullName: "Dr. Márcio Leandro Piske",
      credentials: "CRM: 6412-ES",
      specialty: "Ginecologia, Obstetrícia e Ultrassonografia", 
      category: "Especialidades Médicas", 
      img: "/marcio.webp",
      details: "<ul class='list-disc pl-5 space-y-2 text-climed-navy'><li><strong>Graduação em Medicina:</strong> UFES (Universidade Federal do Espírito Santo)</li><li><strong>Título de Especialista:</strong> Ginecologia e Obstetrícia (TEGO) RQE 4887 e Ultrassonografia em Ginecologia e Obstetrícia (CBR/SBUS/FEBRASGO) RQE 6474</li><li><strong>Membro:</strong> SBUS (Sociedade Brasileira de Ultrassonografia) desde 2008</li><li><strong>Habilitação:</strong> Morfologia Fetal - Translucência Nucal pela Fetal Medicine Foundation</li><li><strong>Pós-graduação:</strong> Atenção Primária à Saúde na UNIVEN - ES e Medicina Fetal na FETUS - SP</li><li><strong>Mestrado:</strong> Ciência e Tecnologia na FVC</li><li><strong>Doutorado (em andamento):</strong> Saúde Pública na CHRISTIAN BUSINESS SCHOOL</li></ul>"
    },
    { 
      name: "Layara", 
      fullName: "Layara Mota Gerhardt",
      credentials: "CRP 16/2918",
      specialty: "Psicologia", 
      category: "Nutrição / Psicologia", 
      img: "/layara.webp",
      details: "<p class='mb-2 text-climed-navy'><strong>Psicóloga Clínica, comportamental e escolar.</strong></p><ul class='list-disc pl-5 space-y-1 mb-4 text-climed-navy'><li>Especialista em Psicologia Clínica pelo CFP, Psicologia comportamental e Psicologia Escolar</li><li>Pós Graduada em Habilidades Sociais Del Prette</li><li>Pós Graduada em Psicopedagogia</li><li>Capacitação em Neuropsicologia</li><li>Aprimoramento em terapia por contingência de Reforçamento com crianças</li></ul><p class='text-climed-navy'>Atua na área de Psicologia Clínica com Adultos, Adolescentes e Crianças com ênfase em terapia comportamental por contingência de reforçamento.</p>"
    },
    { 
      name: "Elizandra", 
      fullName: "Elizandra dos Santos Cozer",
      credentials: "CRFa 6- 5052-ES",
      specialty: "Fonoaudiologia", 
      category: "Fono / Pediatria / Odonto", 
      img: "/elizandra.webp",
      details: "<ul class='list-disc pl-5 space-y-2 text-climed-navy'><li><strong>Graduação em Fonoaudiologia:</strong> UVV (Universidade Vila Velha Espírito Santo) - 2005</li><li><strong>Pós-graduação:</strong> Linguagem com enfoque nos distúrbios de linguagem, aprendizagem e na atuação em Âmbito Educacional</li><li><strong>Pós-graduação:</strong> Língua brasileira de Sinais Libras - Faculdade Metodista ES</li></ul>"
    },
    { 
      name: "Dr. José Lima", 
      fullName: "Dr. José Lima Junior",
      credentials: "CRM: 10772-ES",
      specialty: "Ortopedia e Traumatologia", 
      category: "Especialidades Médicas", 
      img: "/jose-lima.webp",
      details: "<ul class='list-disc pl-5 space-y-2 text-climed-navy'><li><strong>Graduação em Medicina:</strong> EMESCAM (Escola Superior de Ciências da Santa Casa de Misericórdia de Vitória)</li><li><strong>Residência Médica:</strong> Ortopedia e Traumatologia (Santa Casa de Misericórdia de Santos)</li><li><strong>Título de Especialista:</strong> Ortopedia e Traumatologia (SBOT) RQE 9965</li><li><strong>Subespecialização:</strong> Cirurgia do Joelho (Santa Casa de Misericórdia de Santos)</li><li><strong>Membro:</strong> Titular da SBOT (Sociedade Brasileira de Ortopedia e Traumatologia)</li></ul>"
    },
    { 
      name: "Dra. Rosana", 
      fullName: "Dra. Rosana Fornazier do Nascimento",
      credentials: "CRM: 3804-ES",
      specialty: "Pediatria", 
      category: "Fono / Pediatria / Odonto", 
      img: "/rosana.webp",
      details: "<ul class='list-disc pl-5 space-y-2 text-climed-navy'><li><strong>Graduação em Medicina:</strong> Escola de Medicina da Santa Casa de Misericórdia de Vitória (EMESCAM)</li><li><strong>Formação em Pediatria:</strong> Hospital Infantil NSG e Santa Casa de Misericórdia</li><li>Médica pediatra efetiva da SESA (concurso público)</li><li>Educadora Parental</li><li><strong>Áreas de atuação em Neurociência e Comportamento Infantil:</strong><ul class='list-disc pl-5 mt-2 space-y-1'><li>Pós-graduação em Inteligência Parental (Faculdade Focus)</li><li>Formação Internacional em Trauma da Criança Interior (Facilitadora do método chancelado pela Associação Portuguesa de Terapeutas Holísticos)</li><li>Certificação em Educação Parental Aplicada e Neurociências (Instituto Mariana Lima)</li><li>Profissional Trauma Informed</li><li>Psicoterapeuta (Instituto Flávio Pereira)</li><li>Logoterapeuta (Instituto Flávio Pereira)</li><li>Certificação em Atuação Consciente na Adolescência (Escola da Educação Positiva / Attachment Parenting Internacional)</li></ul></li></ul>"
    },
    { 
      name: "Dr. Pedro Cheroto",
      fullName: "Dr. Pedro Paulo Cheroto de Rezende",
      credentials: "CRM: 10382-ES | RQE: 13130",
      specialty: "Neurologia",
      category: "Especialidades Médicas", 
      img: "/dr-pedro-cheroto.webp",
      objectPosition: "center center",
      details: "<ul class='list-disc pl-5 space-y-2 text-climed-navy'><li><strong>Especialidade:</strong> Neurologia</li><li><strong>CRM ES:</strong> 10382 | <strong>RQE:</strong> 13130</li><li><strong>Áreas de atuação:</strong> Cefaleias (dores de cabeça), Epilepsia, AVC (Acidente Vascular Cerebral), Demências e outros distúrbios neurológicos.</li><li>Atendimento humanizado com foco no diagnóstico e tratamento de doenças do sistema nervoso.</li></ul>"
    },
    { 
      name: "Dra. Taíssa", 
      fullName: "Dra. Taissa Bourguignon",
      credentials: "",
      specialty: "Angiologia / Cirurgia Vascular", 
      category: "Especialidades Médicas", 
      img: "/dra-taissa.webp",
      objectPosition: "top",
      details: "<p class='mb-2 text-climed-navy'><strong>Especializada no tratamento de varizes.</strong></p><ul class='list-disc pl-5 space-y-2 text-climed-navy'><li>Graduada em Medicina e Residência Médica em Cirurgia Vascular.</li><li>Utiliza tratamentos modernos e minimamente invasivos para melhorar a circulação e o bem-estar de cada paciente.</li></ul>"
    },
    { 
      name: "Dra. Mariana", 
      fullName: "Dra. Mariana Schwab Machado",
      credentials: "",
      specialty: "Endocrinologia", 
      category: "Especialidades Médicas", 
      img: "/dra-mariana-nova.webp",
      details: "<p class='mb-2 text-climed-navy'>Atendimento especializado em Endocrinologia, visando promover o equilíbrio hormonal e bem-estar.</p>"
    },
    { 
      name: "Dr. Gustavo", 
      fullName: "Gustavo Sabaini Luchi",
      credentials: "CRM ES 9438/ RQE: 8558",
      specialty: "Psiquiatria", 
      category: "Especialidades Médicas", 
      img: "/dr-gustavo.webp",
      details: "<ul class='list-disc pl-5 space-y-2 text-climed-navy'><li><strong>Graduação em Medicina:</strong> Centro Universitário Serra dos Órgãos (Unifeso)</li><li><strong>Residência em Psiquiatria:</strong> Escola de Saúde Mental do Rio de Janeiro(Instituto Municipal Philippe Pinel)</li></ul>"
    },
    { 
      name: "Dr. Cassiano", 
      fullName: "Dr. Cassiano Furlan Borgo",
      credentials: "CRM: 8632 ES",
      specialty: "Urologia e Cirurgia Geral", 
      category: "Especialidades Médicas", 
      img: "/dr-cassiano-borgo.webp",
      details: "<ul class='list-disc pl-5 space-y-2 text-climed-navy'><li><strong>Graduação em Medicina:</strong> Faculdade de Medicina de Valença - RJ (UNIFAA)</li><li><strong>Título de Especialista:</strong> Cirurgia Geral (RQE 7065) e Urologia (RQE 7542)</li><li><strong>Pós-graduando:</strong> Medicina Sexual para Homens - MESH</li></ul>"
    },
    { 
      name: "Dra. Natália", 
      fullName: "Dra. Natália Ferreira",
      credentials: "CRO: 7444",
      specialty: "Odontopediatria", 
      category: "Fono / Pediatria / Odonto", 
      img: "/dra-natalia.webp",
      details: "<p class='mb-2 text-climed-navy'>Sou especialista em Odontopediatria, apaixonada pelo universo infantil e por transformar cada atendimento em uma experiência leve, segura e acolhedora, não apenas para as crianças, mas também para toda a família.</p><p class='mb-2 text-climed-navy'>Minha trajetória na odontologia nasceu do propósito de cuidar com amor, respeito e escuta. Acredito que cada criança é única e merece ser atendida com paciência, carinho e um olhar verdadeiramente humanizado, construindo desde cedo uma relação positiva com a saúde bucal.</p><p class='mb-2 text-climed-navy'>Busco constantemente aliar esse cuidado acolhedor à tecnologia de ponta. Possuo habilitação em laserterapia e utilizo, na minha prática clínica, tanto o laser de baixa potência auxiliando em processos de cicatrização, alívio de dor e inflamação, o laser de alta potência, que proporciona mais precisão, conforto e segurança em procedimentos cirúrgicos, como as frenectomias.</p><p class='mb-2 text-climed-navy'>Mais do que tratar dentes, meu compromisso é promover qualidade de vida, bem-estar e desenvolvimento saudável, orientando os pais com clareza e segurança em cada etapa.</p><p class='text-climed-navy font-semibold mt-4 text-climed-gold italic'>Aqui, cada sorriso é cuidado com amor, ciência e propósito.</p>"
    },
    {
      name: "Dra. Megane",
      fullName: "Megane Larissa Dizerens",
      credentials: "CRM: 22443 - ES",
      specialty: "Médica",
      category: "Especialidades Médicas",
      img: "/dra-megane.webp",
      details: "<p class='mb-2 text-climed-navy'>Atendimento médico geral com foco em cuidado humanizado, prevenção e promoção da saúde integral.</p>"
    },

    {
      name: "Thalita Vervloett",
      fullName: "Thalita Vervloett",
      credentials: "",
      specialty: "Psicopedagogia Infantil",
      category: "Fono / Pediatria / Odonto",
      img: "/thalita-vervloett.webp",
      objectPosition: "center 15%",
      details: "<p class='mb-2 text-climed-navy'><strong>Psicopedagoga Infantil</strong> especializada no desenvolvimento e aprendizagem das crianças.</p><ul class='list-disc pl-5 space-y-2 text-climed-navy mt-2'><li>Avaliação e intervenção psicopedagógica</li><li>Acompanhamento de dificuldades de aprendizagem</li><li>Atendimento humanizado e acolhedor para crianças e famílias</li></ul>"
    }
  ];

  function getPlaceholderImage(name) {
    const initial = name.replace(/^(Dra\.|Dr\.|Clínica de|Clínica|Serviço de)\s*/i, '').trim().charAt(0).toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#1B2631"/>
      <text x="50" y="65" font-family="'Playfair Display', serif" font-weight="bold" font-size="45" fill="#D4AF37" text-anchor="middle">${initial}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  }

  const grid = document.getElementById('professionals-grid');
  const filtersContainer = document.getElementById('specialty-filters');

  if (grid && filtersContainer) {
    const categories = ["Todos", ...new Set(professionals.map(p => p.category))];

    filtersContainer.innerHTML = categories.map((cat, index) =>
      `<button type="button" aria-pressed="${index === 0}" class="filter-btn ${index === 0 ? 'bg-climed-navy text-white shadow-lg border-climed-navy' : 'bg-transparent text-climed-navy border-climed-navy/20 hover:bg-climed-navy hover:text-white'} px-4 py-2 md:px-5 md:py-2.5 rounded-full border font-medium text-xs md:text-sm transition-all duration-300" data-filter="${cat}">
        ${cat}
      </button>`
    ).join('');

    const renderCards = (filterCategory) => {
      grid.innerHTML = '';
      const filtered = filterCategory === 'Todos' ? professionals : professionals.filter(p => p.category === filterCategory);

      filtered.forEach((p, i) => {
        const imgSrc = p.img || getPlaceholderImage(p.name);
        const isLink = p.link ? true : false;
        const linkWrapperStart = isLink ? `<a href="${p.link}" class="w-full h-full block">` : `<div>`;
        const linkWrapperEnd = isLink ? `</a>` : `</div>`;

        // Added max-w-sm constraints to keep it nicely proportioned 
        const originalIndex = professionals.indexOf(p);
        const altText = `Foto do(a) ${p.fullName || p.name}, especialista em ${p.specialty} na clínica Climed em São Gabriel da Palha - ES`;

        const cardHTML = `
          <div class="card-premium group flex flex-col items-center text-center opacity-0 translate-y-4 transition-all duration-500 relative ${isLink ? 'ring-2 ring-climed-gold/50 cursor-pointer hover:-translate-y-2' : ''}" style="transition-delay: ${i * 30}ms">
            ${linkWrapperStart}
              ${isLink ? '<div class="absolute top-2 right-2 bg-climed-gold text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-full z-10 animate-pulse">NOVO GUIA</div>' : ''}
              <div class="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 mb-4 md:mb-6 mx-auto rounded-full overflow-hidden border-2 border-climed-gold/20 shadow-premium ${!isLink ? 'cursor-pointer' : ''} group-hover:border-climed-gold/50 transition-colors shrink-0" ${!isLink ? `data-open-professional role="button" tabindex="0" aria-label="Ver perfil de ${p.fullName || p.name}"` : ''}>
                <img src="${imgSrc}" alt="${altText}" data-id="${originalIndex}" width="320" height="320" decoding="async" class="w-full h-full object-cover ${!isLink ? 'clickable-image' : ''}" style="object-position: ${p.objectPosition || 'center'};" loading="lazy" />
              </div>
              <h3 class="text-sm sm:text-lg md:text-xl font-bold text-climed-navy mb-1 leading-tight w-full" title="${p.name}">${p.name}</h3>
              <p class="${isLink ? 'text-climed-blue' : 'text-climed-gold'} font-semibold text-xs sm:text-sm md:text-sm leading-snug">${p.specialty}</p>
            ${linkWrapperEnd}
          </div>
        `;
        grid.insertAdjacentHTML('beforeend', cardHTML);
      });

      // Animate entry
      setTimeout(() => {
        const generatedCards = grid.querySelectorAll('.card-premium');
        generatedCards.forEach(card => card.classList.remove('opacity-0', 'translate-y-4'));
      }, 50);
    };

    renderCards('Todos');

    grid.addEventListener('keydown', (event) => {
      const profileControl = event.target.closest('[data-open-professional]');
      if (!profileControl || (event.key !== 'Enter' && event.key !== ' ')) return;
      event.preventDefault();
      profileControl.querySelector('img')?.click();
    });

    filtersContainer.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        filtersContainer.querySelectorAll('button').forEach(btn => {
          btn.setAttribute('aria-pressed', String(btn === e.target));
          btn.classList.remove('bg-climed-navy', 'text-white', 'shadow-lg', 'border-climed-navy');
          btn.classList.add('bg-transparent', 'text-climed-navy', 'border-climed-navy/20');
        });
        e.target.classList.remove('bg-transparent', 'text-climed-navy', 'border-climed-navy/20');
        e.target.classList.add('bg-climed-navy', 'text-white', 'shadow-lg', 'border-climed-navy');

        renderCards(e.target.dataset.filter);
      }
    });
  }

  // Rastreamento GA4: Disparo do evento agendar_consulta
  document.body.addEventListener('click', (e) => {
    const target = e.target.closest('[data-ga-event="agendar_consulta"]') ||
                   (e.target.closest('a') && e.target.closest('a').href && e.target.closest('a').href.includes('wa.me') ? e.target.closest('a') : null);

    if (target) {
      const origem = target.getAttribute('data-ga-origem') || target.getAttribute('data-origem') || 'geral';
      const servico = target.getAttribute('data-ga-servico') || 'consulta_geral';
      const medico = target.getAttribute('data-ga-medico') || null;
      const especialidade = target.getAttribute('data-ga-especialidade') || null;

      const eventParams = {
        origem_clique: origem,
        tipo_servico: servico,
        canal_contato: 'whatsapp',
        link_url: target.href || '',
        page_location: window.location.href
      };

      if (medico) eventParams.medico_nome = medico;
      if (especialidade) eventParams.especialidade = especialidade;

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'agendar_consulta', eventParams);
        console.log('[GA4 Event]: agendar_consulta', eventParams);
      }
    }
  });
});



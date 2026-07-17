// 인천 선생님 곁에 — 소프트케어
// 화면 렌더링 및 상태 관리 (바닐라 JS, 빌드 도구 없이 동작)

const App = {
  state: {
    page: 'home',
    quick: null,
    region: null,
    faqOpen: null,
    stepIdx: 0,
    filters: {},
    formModal: null,
    orgCat: '전체',
    checks: {},
    moreOpen: false
  },

  init() {
    try { this.state.checks = JSON.parse(localStorage.getItem('icn-gyeote-checks') || '{}'); } catch (e) { this.state.checks = {}; }
    this.render();
  },

  setState(patch) {
    Object.assign(this.state, patch);
    this.render();
  },

  nav(p) {
    this.setState({ page: p, moreOpen: false });
    window.scrollTo(0, 0);
  },

  toggleMore() {
    this.setState({ moreOpen: !this.state.moreOpen });
  },

  toggleCheck(key) {
    const checks = { ...this.state.checks, [key]: !this.state.checks[key] };
    this.setState({ checks });
    try { localStorage.setItem('icn-gyeote-checks', JSON.stringify(checks)); } catch (e) {}
  },

  toggleFilter(group, opt) {
    const f = { ...this.state.filters };
    const set = new Set(f[group] || []);
    set.has(opt) ? set.delete(opt) : set.add(opt);
    f[group] = [...set];
    this.setState({ filters: f });
  },

  clearFilters() { this.setState({ filters: {} }); },

  copyText(text) {
    const done = () => { this.showToast('내용을 복사했어요'); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done();
  },

  showToast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('show'), 1600);
  },

  downloadForm(i) {
    const f = FORMS[i];
    const blob = new Blob(['﻿' + f.t + '\n\n' + f.body], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = f.t + '.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  },

  printForm(i) {
    const f = FORMS[i];
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write('<html><head><title>' + esc(f.t) + '</title><style>body{font-family:sans-serif;padding:40px;line-height:1.8}pre{white-space:pre-wrap;font-family:inherit;font-size:14px}</style></head><body><h1>' + esc(f.t) + '</h1><pre>' + esc(f.body) + '</pre></body></html>');
    w.document.close();
    w.focus();
    w.print();
  },

  render() {
    const S = this.state;
    const root = document.getElementById('app');
    root.innerHTML = `
      ${this.renderHeader()}
      ${S.page === 'home' ? this.renderHome() : ''}
      ${S.page === 'proc' ? this.renderProc() : ''}
      ${S.page === 'guide' ? this.renderGuide() : ''}
      ${S.page === 'forms' ? this.renderForms() : ''}
      ${S.page === 'support' ? this.renderSupport() : ''}
      ${S.page === 'orgs' ? this.renderOrgs() : ''}
      ${S.page === 'about' ? this.renderAbout() : ''}
      ${this.renderFaq()}
      ${this.renderFooter()}
      ${this.renderBottomNav()}
      ${S.formModal !== null ? this.renderFormModal() : ''}
      ${S.moreOpen ? this.renderMoreSheet() : ''}
      <div id="toast" class="toast"></div>
    `;
    document.body.style.overflow = (S.formModal !== null || S.moreOpen) ? 'hidden' : '';
  },

  renderHeader() {
    const S = this.state;
    const navHtml = PAGES.map(([id, label]) =>
      `<button class="nav-btn ${S.page === id ? 'active' : ''}" onclick="App.nav('${id}')">${label}</button>`
    ).join('');
    return `
      <header class="site-header">
        <div class="header-inner">
          <div class="brand-badge">곁</div>
          <div class="brand-text">
            <div class="brand-name">인천 선생님 곁에</div>
            <div class="brand-sub">인천 교육활동 보호·대응 가이드</div>
          </div>
          <nav class="main-nav" aria-label="주요 메뉴">${navHtml}</nav>
          <a href="tel:0321395" class="header-call"><span aria-hidden="true">☎</span><span class="header-call-num"> 032-1395</span></a>
          <button class="mobile-menu-btn" onclick="App.toggleMore()" aria-label="전체 메뉴 열기">☰</button>
        </div>
      </header>
    `;
  },

  // ══════════════ 홈 ══════════════
  renderHome() {
    return `
      ${this.renderHero()}
      ${this.renderMarquee()}
      ${this.renderQuickHelp()}
      ${this.renderSteps()}
      ${this.renderCta()}
      ${this.renderSituChips()}
      ${this.renderProtections()}
      ${this.renderSupportCards()}
      ${this.renderRegionFinder()}
    `;
  },

  renderHero() {
    return `
      <section class="hero">
        <div>
          <span class="hero-chip">🌿 「2026년 인천 교육활동 보호 시행계획」 기준</span>
          <h1>선생님 곁에 늘 가까이,<br><span class="highlight">교육활동 침해 대응부터 회복까지</span><br>함께합니다</h1>
          <p class="hero-sub">불안하고 지친 마음, 혼자 감당하지 않으셔도 돼요.<br>무엇을 먼저 해야 하는지, 어디에 신고하고 어떤 지원을 받을 수 있는지 인천의 절차에 맞게 차근차근 안내해 드릴게요.</p>
          <div class="hero-btn-row">
            <button class="btn btn-primary" onclick="App.nav('proc')">지금 대응 절차 확인하기</button>
            <a href="tel:0321395" class="btn btn-accent">☎ 032-1395 바로 연결</a>
            <button class="btn btn-ghost" onclick="App.nav('home'); document.getElementById('region-finder')?.scrollIntoView({behavior:'smooth'})">내 교육지원청 찾기</button>
            <button class="btn btn-text" onclick="App.nav('forms')">기록지·체크리스트 열기</button>
          </div>
        </div>
        <div class="hero-art">
          <div class="hero-blob"></div>
          <div class="hero-card">
            <div class="hero-icon-circle">💬</div>
            <div style="font-weight:700;font-size:16px">오늘, 어떤 일이 있으셨나요?</div>
            <div class="hero-art-slot">따뜻한 사진·일러스트 자리</div>
            <div class="tag-row">
              <span class="badge badge-main">심리·치유</span>
              <span class="badge badge-lav">법률 지원</span>
              <span class="badge badge-accent">신고·심의</span>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  renderMarquee() {
    const items = ['예방', '✿', '대응', '✿', '치유', '✿', '기반 구축', '✿', '인천 원스톱 지원 032-1395', '✿'];
    const track = items.concat(items).map(s => `<span>${s}</span>`).join('');
    return `<div class="marquee" aria-hidden="true"><div class="marquee-track">${track}</div></div>`;
  },

  renderQuickHelp() {
    const S = this.state;
    const items = QUICK.map((q, i) => `
      <button class="quick-btn q${i % 4} ${S.quick === q.id ? 'active' : ''}" onclick="App.setState({quick: ${S.quick === q.id ? 'null' : `'${q.id}'`}})">
        ${q.e} ${q.label}
      </button>
    `).join('');
    const detail = QUICK.find(q => q.id === S.quick);
    return `
      <section class="section">
        <div class="eyebrow"><span class="eyebrow-dot"></span>빠른 안내</div>
        <h2 class="h2">지금 어떤 도움이 필요하신가요?</h2>
        <p class="section-sub">상황을 선택하면 지금 가장 먼저 해야 할 일과 연락할 기관을 바로 보여 드려요.</p>
        <div class="grid-auto" style="margin-bottom:22px">${items}</div>
        ${detail ? `
          <div class="quick-detail">
            ${detail.urgent ? `<div class="urgent-box">현재 폭행, 협박, 난입 등으로 신변의 위험이 지속되는 경우에는 행정 절차보다 현장 이탈과 안전 확보, 관리자 보고, 경찰 신고가 우선입니다.</div>` : ''}
            <div class="grid-auto-230">
              <div><div class="detail-label-accent">지금 가장 먼저 해야 할 일</div><div class="detail-text">${detail.first}</div></div>
              <div><div class="detail-label-main">연락해야 할 기관</div><div class="detail-text">${detail.org}</div></div>
              <div><div class="detail-label-main">준비할 기록과 증거</div><div class="detail-text">${detail.records}</div></div>
              <div><div class="detail-label-lav">신청 가능한 지원</div><div class="detail-text">${detail.supports}</div></div>
              <div><div class="detail-label-muted">다음 절차</div><div class="detail-text">${detail.next}</div></div>
            </div>
            <div class="btn-row" style="margin-top:22px">
              <a href="tel:0321395" class="btn btn-accent">☎ 긴급 연락 032-1395</a>
              <button class="btn btn-ghost" onclick="App.nav('proc')">관련 대응 절차 보기 →</button>
            </div>
          </div>
        ` : ''}
      </section>
    `;
  },

  renderSteps() {
    const rows = STEPS.map((s, i) => `
      <div class="step-row">
        <div class="step-num-col">
          <div class="step-num c${i}">${s.n}</div>
          ${i < 3 ? '<div class="step-line"></div>' : ''}
        </div>
        <div class="step-tl-card">
          <div class="step-tl-head">
            <span class="step-tl-title">${s.title}</span>
            <span class="badge ${i < 2 ? 'badge-main' : i === 2 ? 'badge-lav' : 'badge-accent'}">${s.org}</span>
            ${s.deadline ? `<span class="deadline-badge">⏱ ${s.deadline}</span>` : ''}
          </div>
          <div class="step-tl-sum">${s.sum}</div>
        </div>
      </div>
    `).join('');
    return `
      <section class="section-alt">
        <div class="section-alt-inner">
          <div class="eyebrow"><span class="eyebrow-dot"></span>사안 처리 절차</div>
          <h2 class="h2">사안 처리 4단계, 차근차근</h2>
          <p class="section-sub">각 단계의 담당 기관과 기한을 확인하세요. 실제 기한·제출 방식은 최신 매뉴얼과 소속 교육지원청 안내를 다시 확인해 주세요.</p>
          <div class="steps-timeline">${rows}</div>
        </div>
      </section>
    `;
  },

  renderCta() {
    return `
      <section class="section">
        <div class="cta-band">
          <div style="flex:1;min-width:300px">
            <div class="cta-eyebrow">인천 원스톱 지원</div>
            <div class="cta-title">한 번의 전화로,<br>필요한 지원까지 연결해요</div>
            <div class="cta-sub">교육활동 침해 대응, 법률, 상담, 치료, 신고 및 심의 절차를 안내받을 수 있어요.</div>
            <div style="display:flex;flex-direction:column;gap:8px;max-width:430px;margin-top:16px">
              <div class="cta-row"><span class="cta-num n1">1</span><span style="font-size:14px">교육활동 침해 관련 <strong>법률·심리상담·치료 및 지원</strong> 문의</span></div>
              <div class="cta-row"><span class="cta-num n2">2</span><span style="font-size:14px"><strong>침해 신고·지역교권보호위원회 심의</strong> 관련 문의</span></div>
            </div>
            <div class="cta-note">※ 전화 연결 방식과 담당 부서는 변경될 수 있어요 · 최종 확인 ${LAST_CONFIRMED}</div>
          </div>
          <div style="text-align:center;flex:1;min-width:280px">
            <div class="cta-phone-label">인천 교육활동 보호 직통번호</div>
            <a href="tel:0321395" class="cta-phone">032-1395</a>
            <div><a href="tel:0321395" class="btn cta-btn">지금 바로 연결하기</a></div>
          </div>
        </div>
      </section>
    `;
  },

  renderSituChips() {
    const chips = SITU_CHIPS.map((label, i) =>
      `<span class="chip badge-${['main', 'accent', 'lav', 'danger'][i % 4]}">${label}</span>`
    ).join('');
    return `
      <section class="section">
        <div class="eyebrow"><span class="eyebrow-dot"></span>상황별 대응</div>
        <h2 class="h2">이런 상황이라면, 이렇게</h2>
        <p class="section-sub">16가지 상황별 가이드에서 지금 상황과 가장 가까운 안내를 찾아보세요.</p>
        <div class="chip-row">${chips}</div>
        <p style="font-size:12.5px;color:var(--text-faint);margin:18px 0 0;line-height:1.6">구체적인 사안의 교육활동 침해 해당 여부는 사실관계 조사와 지역교권보호위원회 심의를 통해 판단될 수 있습니다.</p>
      </section>
    `;
  },

  renderProtections() {
    const cards = PROTECTIONS.map(p => `
      <div class="card">
        <div class="protect-head"><span style="font-size:20px">${p.e}</span><span class="protect-title">${p.t}</span></div>
        <div class="protect-desc">${p.d}</div>
      </div>
    `).join('');
    return `
      <section class="section-alt">
        <div class="section-alt-inner">
          <div class="eyebrow"><span class="eyebrow-dot"></span>피해 교원 보호조치</div>
          <h2 class="h2">선생님이 학교에 요청할 수 있는 보호조치</h2>
          <p class="section-sub">보호조치는 피해 교원의 의사를 확인한 후 이루어져요. 필요한 조치를 학교 관리자와 교권보호책임관에게 요청하세요.</p>
          <div class="grid-auto-250">${cards}</div>
        </div>
      </section>
    `;
  },

  renderSupportCards() {
    const cards = SUPPORT_CARDS.map((s, i) => `
      <div class="support-card s${i}">
        <div class="support-emoji">${s.e}</div>
        <div class="support-cat">${s.cat}</div>
        <div class="support-title">${s.t}</div>
        <div class="support-desc">${s.d}</div>
      </div>
    `).join('');
    return `
      <section class="section">
        <div class="eyebrow"><span class="eyebrow-dot"></span>지원 체계</div>
        <h2 class="h2">법률부터 치유·회복까지</h2>
        <p class="section-sub">인천 교원이라면 누구나, 032-1395 한 통으로 연결돼요.</p>
        <div class="grid-auto-250">${cards}</div>
      </section>
    `;
  },

  renderRegionFinder() {
    const S = this.state;
    const btns = REGIONS.map((r, i) =>
      `<button class="pill-btn ${S.region === i ? 'active' : ''}" onclick="App.setState({region:${i}})">${r.label}</button>`
    ).join('');
    const sel = S.region === null ? null : REGIONS[S.region];
    return `
      <section class="section-alt" id="region-finder">
        <div class="section-alt-inner">
          <div class="eyebrow"><span class="eyebrow-dot"></span>내 교육지원청 찾기</div>
          <h2 class="h2">학교 소재 지역을 선택해 주세요</h2>
          <p class="section-sub">교육활동 침해 신고와 지역교권보호위원회 심의는 <strong>소속 교육지원청</strong>이 담당해요.</p>
          <div class="chip-row" style="margin-bottom:18px">${btns}</div>
          ${sel ? `
            <div class="region-card">
              <div>
                <div class="detail-label-main">담당 교육지원청</div>
                <div style="font-weight:700;font-size:18px">${sel.office}</div>
                <div style="font-size:13px;color:var(--text-faint);margin-top:4px">${sel.label}</div>
              </div>
              <div class="detail-text"><strong>신고·심의</strong> — 소속 교육지원청 또는 032-1395(2번)로 연락하세요.</div>
              <div class="detail-text"><strong>지원 문의</strong> — 법률·심리상담·치료는 032-1395(1번) · 대표번호는 홈페이지에서 최신 확인.</div>
            </div>
          ` : ''}
        </div>
      </section>
    `;
  },

  // ══════════════ 대응 절차 ══════════════
  renderProc() {
    const S = this.state;
    const tabs = STEPS.map((s, i) => `
      <button class="step-tab ${S.stepIdx === i ? 'active' : ''}" onclick="App.setState({stepIdx:${i}})">
        <span class="step-tab-n">${s.n}</span>
        <span class="step-tab-title">${s.title}</span>
        <span class="badge ${i < 2 ? 'badge-main' : i === 2 ? 'badge-lav' : 'badge-accent'} step-tab-badge">${s.org}</span>
      </button>
    `).join('');
    const step = STEPS[S.stepIdx];
    const detail = STEP_DETAIL[S.stepIdx];
    const items = detail.items.map((label, j) => {
      const key = 's' + S.stepIdx + '-' + j;
      const done = !!S.checks[key];
      return `
        <label class="check-item ${done ? 'done' : ''}">
          <input type="checkbox" ${done ? 'checked' : ''} onchange="App.toggleCheck('${key}')">
          <span class="label">${label}</span>
        </label>
      `;
    }).join('');
    const doneCount = detail.items.filter((_, j) => S.checks['s' + S.stepIdx + '-' + j]).length;
    const listBox = (title, arr, cls) => `
      <div class="info-box ${cls || ''}">
        <div class="info-box-title">${title}</div>
        ${arr.map(x => `<div class="info-box-line">· ${x}</div>`).join('')}
      </div>
    `;
    return `
      <section class="section">
        <div class="eyebrow"><span class="eyebrow-dot"></span>대응 절차</div>
        <h1 class="page-title">교육활동 침해 사안 처리 4단계</h1>
        <p class="section-sub">체크한 내용은 이 기기 안에서만 임시 저장돼요.</p>
        <div class="urgent-box">범죄행위가 의심되거나 긴급한 위험이 있다면 절차 확인보다 안전 확보와 경찰 신고(112)가 우선이에요.</div>
        <div class="step-tabs-grid">${tabs}</div>
        <div class="proc-card">
          <div class="proc-head">
            <h2>${step.n}. ${step.title}</h2>
            <span class="badge ${S.stepIdx < 2 ? 'badge-main' : S.stepIdx === 2 ? 'badge-lav' : 'badge-accent'}">담당 · ${step.org}</span>
            ${step.deadline ? `<span class="deadline-badge">⏱ ${step.deadline}</span>` : ''}
          </div>
          <p class="proc-sum">${step.sum}</p>
          <div class="proc-check-label">핵심 행동 <span class="proc-check-count">(${doneCount}/${detail.items.length} 완료)</span></div>
          <div class="check-list">${items}</div>
          <div class="grid-auto-250">
            ${listBox('피해 교원이 확인할 일', detail.teacher)}
            ${listBox('학교에 요청·확인할 일', detail.school)}
            ${listBox('교육지원청이 처리하는 일', detail.office)}
            ${listBox('준비 서류·증거자료', detail.docs)}
          </div>
          <div class="grid-auto-250" style="margin-top:20px">
            ${listBox('주의사항', detail.caution, 'caution')}
            <div class="info-box next"><div class="info-box-title">다음 단계 기준</div><div style="font-size:13.5px;line-height:1.6">${detail.next}</div></div>
          </div>
        </div>
        <p class="proc-note">※ 기한 정보는 참고용이에요. 실제 적용 기한과 제출 방식은 최신 매뉴얼과 소속 교육지원청 안내를 확인하세요.</p>
      </section>
    `;
  },

  // ══════════════ 상황별 가이드 ══════════════
  renderGuide() {
    const S = this.state;
    const groupsHtml = FILTER_DEFS.map(d => {
      const opts = d.opts.map(o => {
        const on = (S.filters[d.g] || []).includes(o);
        return `<button class="pill-btn-sm ${on ? 'active' : ''}" onclick="App.toggleFilter('${d.g}','${o}')">${o}</button>`;
      }).join('');
      return `<div class="filter-group-row"><span class="filter-group-name">${d.g}</span>${opts}</div>`;
    }).join('');

    const filtered = SITUS.filter(s => FILTER_DEFS.every(d => {
      const sel = S.filters[d.g] || [];
      return sel.length === 0 || sel.some(o => d.test(s, o));
    }));

    const cards = filtered.map(s => `
      <div class="card situ-card">
        <div class="situ-tags">
          <span class="badge ${URGENCY_BADGE_CLASS[s.urgency]}">${s.urgency}</span>
          <span class="badge badge-muted">${s.subject}</span>
        </div>
        <div class="situ-title">${s.t}</div>
        <div class="situ-ex"><strong>예시</strong> — ${s.ex}</div>
        <div class="situ-facts">
          <div><strong>즉시 행동</strong> · ${s.act}</div>
          <div><strong>학교에 알릴 내용</strong> · ${s.report}</div>
          <div><strong>확보할 증거</strong> · ${s.evidence}</div>
          <div><strong>하지 말 것</strong> · ${s.dont}</div>
          <div><strong>이용 가능 지원</strong> · ${s.programs}</div>
          <div><strong>신고·상담 기관</strong> · ${s.orgs}</div>
        </div>
        <button class="situ-goto" onclick="App.nav('proc')">관련 절차 바로가기 →</button>
      </div>
    `).join('');

    return `
      <section class="section">
        <div class="eyebrow"><span class="eyebrow-dot"></span>상황별 가이드</div>
        <h1 class="page-title">상황에 맞는 대응 방법 찾기</h1>
        <div class="urgent-box">현재 폭행, 협박, 난입 등으로 신변의 위험이 지속되는 경우에는 행정 절차보다 현장 이탈과 안전 확보, 관리자 보고, 경찰 신고가 우선입니다.</div>
        <div class="card filter-card">
          ${groupsHtml}
          <div class="filter-footer">
            <span class="filter-count">${filtered.length}개 상황 검색됨</span>
            <button class="filter-reset" onclick="App.clearFilters()">필터 초기화</button>
          </div>
        </div>
        <div class="grid-auto-330">${cards}</div>
      </section>
    `;
  },

  // ══════════════ 서식·체크리스트 ══════════════
  renderForms() {
    const cards = FORMS.map((f, i) => `
      <div class="card form-card">
        <span class="badge ${f.official ? 'badge-main' : 'badge-muted'}">${f.official ? '공식 제출 서식 준비용' : '참고용 기록지'}</span>
        <div class="form-title">${f.t}</div>
        <div class="form-desc">${f.d}</div>
        <div class="form-actions">
          <button class="btn btn-primary btn-small" onclick="App.setState({formModal:${i}})">미리보기</button>
          <button class="btn btn-ghost btn-small" onclick="App.copyText(${JSON.stringify(f.t + '\n\n' + f.body)})">복사</button>
          <button class="btn btn-ghost btn-small" onclick="App.downloadForm(${i})">내려받기</button>
          <button class="btn btn-ghost btn-small" onclick="App.printForm(${i})">인쇄</button>
        </div>
      </div>
    `).join('');
    return `
      <section class="section">
        <div class="eyebrow"><span class="eyebrow-dot"></span>서식·체크리스트</div>
        <h1 class="page-title">바로 쓰는 기록지와 체크리스트</h1>
        <div class="urgent-box">공식 서식은 제출 전 소속 학교·교육지원청의 최신 서식인지 반드시 확인하세요. 민감한 개인정보는 공개된 공간에 입력하지 마세요.</div>
        <div class="grid-auto-300">${cards}</div>
      </section>
    `;
  },

  renderFormModal() {
    const f = FORMS[this.state.formModal];
    return `
      <div class="modal-overlay" onclick="App.setState({formModal:null})">
        <div class="modal-box" onclick="event.stopPropagation()">
          <div class="modal-head">
            <h3 class="h2" style="margin:0">${f.t}</h3>
            <button class="modal-close" onclick="App.setState({formModal:null})">✕</button>
          </div>
          <span class="badge ${f.official ? 'badge-main' : 'badge-muted'}">${f.official ? '공식 제출 서식 준비용' : '참고용 기록지'}</span>
          ${f.official ? `<div class="urgent-box" style="margin-top:14px">제출 전 소속 학교·교육지원청의 최신 공식 서식인지 반드시 확인해 주세요.</div>` : ''}
          <pre class="modal-body">${esc(f.body)}</pre>
          <div class="modal-actions">
            <button class="btn btn-ghost" onclick="App.setState({formModal:null})">닫기</button>
            <button class="btn btn-ghost" onclick="App.setState({formModal:null}); App.nav('proc')">관련 절차 확인 →</button>
          </div>
        </div>
      </div>
    `;
  },

  // ══════════════ 지원제도 ══════════════
  renderSupport() {
    const cards = PROGRAMS.map(p => `
      <div class="card program-card">
        <div class="situ-tags">
          <span class="badge ${PROGRAM_AREA_CLASS[p.area]}">${p.area}</span>
          <span class="badge ${PROGRAM_STATUS_CLASS[p.status]}">${p.status}</span>
        </div>
        <div class="program-title">${p.t}</div>
        <div class="program-sum">${p.sum}</div>
        <div class="program-facts">
          <div><strong>대상</strong> · ${p.target}</div>
          <div><strong>담당</strong> · ${p.org}</div>
          <div><strong>신청 방법</strong> · ${p.apply}</div>
          <div><strong>준비 자료</strong> · ${p.docs}</div>
          <div><strong>처리 기한</strong> · ${p.deadline}</div>
          <div><strong>연락처</strong> · ${linkifyPhone(p.contact)}</div>
        </div>
        <div class="program-updated">최종 확인 ${LAST_CONFIRMED}</div>
      </div>
    `).join('');
    return `
      <section class="section">
        <div class="eyebrow"><span class="eyebrow-dot"></span>인천 지원제도</div>
        <h1 class="page-title">신청할 수 있는 지원, 한눈에</h1>
        <p class="section-sub">「2026년 인천 교육활동 보호 시행계획」 기준. 시행 상태와 최종 확인 날짜를 함께 확인하세요.</p>
        <div class="grid-auto-320">${cards}</div>
      </section>
    `;
  },

  // ══════════════ 지원기관 ══════════════
  renderOrgs() {
    const S = this.state;
    const cats = ORG_CATS.map(c =>
      `<button class="pill-btn ${S.orgCat === c ? 'active' : ''}" onclick="App.setState({orgCat:'${c}'})">${c}</button>`
    ).join('');
    const filtered = ORGS.filter(o => S.orgCat === '전체' || o.cat === S.orgCat);
    const cards = filtered.map(o => `
      <div class="card org-card">
        <span class="badge ${ORG_CAT_CLASS[o.cat]}">${o.cat}</span>
        <div class="org-title">${o.name}</div>
        <div class="org-facts">
          <div><strong>담당 지역</strong> · ${o.region}</div>
          <div><strong>지원 내용</strong> · ${o.role}</div>
          <div><strong>연락처</strong> · ${linkifyPhone(o.contact)}</div>
          <div><strong>운영 시간</strong> · ${o.hours}</div>
        </div>
      </div>
    `).join('');
    return `
      <section class="section">
        <div class="eyebrow"><span class="eyebrow-dot"></span>지원기관</div>
        <h1 class="page-title">인천 교원이 도움을 요청할 수 있는 곳</h1>
        <div class="org-cats-row">${cats}</div>
        <div class="grid-auto-300">${cards}</div>
      </section>
    `;
  },

  // ══════════════ 소개 ══════════════
  renderAbout() {
    return `
      <section class="faq-section">
        <div class="eyebrow"><span class="eyebrow-dot"></span>소개</div>
        <h1 class="page-title">인천 선생님 곁에</h1>
        <p class="about-p">‘인천 선생님 곁에’는 인천 지역 교원이 교육활동 침해, 아동학대 신고, 학교민원, 특이민원 등의 어려움을 겪었을 때 현재 상황을 판단하고, 인천광역시교육청의 지원 절차와 필요한 행동을 단계별로 확인할 수 있도록 돕는 안내 플랫폼이에요.</p>
        <p class="about-p">사이트의 정보와 절차는 「2026년 인천 교육활동 보호 시행계획」을 기준으로 구성했으며, ‘교권침해’라는 표현과 공식 용어인 ‘교육활동 침해’를 함께 사용하되 주요 메뉴와 절차에서는 공식 용어를 우선 사용해요.</p>
        <div class="card about-note">개인정보 보호를 위해 체크리스트와 기록 내용을 서버에 저장하지 않아요. 체크 상태는 사용자의 기기 안에서만 임시 저장돼요.</div>
      </section>
    `;
  },

  // ══════════════ FAQ / 푸터 ══════════════
  renderFaq() {
    const S = this.state;
    const items = FAQS.map((f, i) => {
      const open = S.faqOpen === i;
      return `
        <div class="faq-item">
          <button class="faq-btn" aria-expanded="${open}" onclick="App.setState({faqOpen:${open ? 'null' : i}})">
            <span>${f.q}</span><span class="faq-mark">${open ? '−' : '+'}</span>
          </button>
          ${open ? `<div class="faq-answer">${f.a}</div>` : ''}
        </div>
      `;
    }).join('');
    return `
      <section class="faq-section">
        <div class="eyebrow center"><span class="eyebrow-dot"></span>자주 묻는 질문</div>
        <h2 class="h2 center">궁금한 점이 있으신가요?</h2>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:24px">${items}</div>
      </section>
    `;
  },

  renderFooter() {
    return `
      <footer class="site-footer">
        <div class="footer-inner">
          <div class="footer-brand-row">
            <div class="footer-badge">곁</div>
            <div><div style="font-weight:700;font-size:15px">인천 선생님 곁에</div><div style="font-size:11.5px;opacity:.7">인천 교육활동 보호·대응 가이드</div></div>
            <a href="tel:0321395" class="footer-call">☎ 032-1395</a>
          </div>
          <p class="footer-p">본 사이트는 「2026년 인천 교육활동 보호 시행계획」을 바탕으로 교육활동 침해 대응 절차를 이해하기 쉽게 안내하기 위한 참고용 서비스입니다. 실제 사안의 교육활동 침해 해당 여부, 신고·조사·심의 절차, 보호조치 및 지원 여부는 구체적인 사실관계와 관련 법령, 최신 교육활동 보호 매뉴얼, 인천광역시교육청 및 소속 교육지원청의 안내에 따라 달라질 수 있습니다.</p>
          <p class="footer-p">폭행, 협박, 난입 등으로 현재 신변의 위험이 있는 경우에는 사이트 이용보다 현장 이탈, 안전 확보, 관리자 보고 및 경찰 신고를 우선해 주세요. 교육활동 침해 사안과 관련된 개인정보와 사건 자료를 공개된 게시판이나 외부 공유 공간에 입력하지 마세요.</p>
          <p class="footer-fine">법령·행정 절차·지원 금액·기관 연락처 등은 변경될 수 있습니다 · 최종 확인 ${LAST_CONFIRMED}</p>
        </div>
      </footer>
    `;
  },

  // ══════════════ 모바일 하단 내비게이션 ══════════════
  renderBottomNav() {
    const S = this.state;
    const isMoreTab = ['forms', 'support', 'about'].includes(S.page);
    const tab = (page, icon, label, active, action) => `
      <button class="bn-btn ${active ? 'active' : ''}" onclick="${action}">
        <span class="bn-icon" aria-hidden="true">${icon}</span><span class="bn-label">${label}</span>
      </button>
    `;
    return `
      <nav class="bottom-nav" aria-label="하단 메뉴">
        ${tab('home', '🏠', '홈', S.page === 'home', "App.nav('home')")}
        ${tab('proc', '📋', '대응절차', S.page === 'proc', "App.nav('proc')")}
        ${tab('guide', '🧭', '상황가이드', S.page === 'guide', "App.nav('guide')")}
        ${tab('orgs', '🏢', '지원기관', S.page === 'orgs', "App.nav('orgs')")}
        ${tab('more', '☰', '전체', isMoreTab || S.moreOpen, 'App.toggleMore()')}
      </nav>
    `;
  },

  renderMoreSheet() {
    return `
      <div class="modal-overlay sheet-overlay" onclick="App.setState({moreOpen:false})">
        <div class="sheet-box" onclick="event.stopPropagation()">
          <div class="modal-head">
            <h3 class="h2" style="margin:0">전체 메뉴</h3>
            <button class="modal-close" onclick="App.setState({moreOpen:false})">✕</button>
          </div>
          <div class="sheet-menu">
            <button class="sheet-item" onclick="App.nav('forms')"><span aria-hidden="true">🗂️</span> 서식·체크리스트</button>
            <button class="sheet-item" onclick="App.nav('support')"><span aria-hidden="true">🤝</span> 지원제도</button>
            <button class="sheet-item" onclick="App.nav('about')"><span aria-hidden="true">ℹ️</span> 소개</button>
          </div>
        </div>
      </div>
    `;
  }
};

function esc(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function linkifyPhone(text) {
  return String(text).replace(/(\d{2,4}-\d{3,4}(?:\(\d번\))?|\b112\b)/g, m => {
    const tel = m.replace(/\(.*?\)/, '').replace(/-/g, '');
    return '<a href="tel:' + tel + '" class="tel-link">' + m + '</a>';
  });
}

document.addEventListener('DOMContentLoaded', () => App.init());

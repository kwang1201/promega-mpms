const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat, ExternalHyperlink,
  TabStopType, TabStopPosition
} = require("docx");

// Promega brand colors
const NAVY = "13294B";
const GOLD = "FDB813";
const TEAL = "199AC2";
const GRAY = "515151";
const LIGHT_BG = "F5F5F5";
const WHITE = "FFFFFF";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0 };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function headerCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: NAVY, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: WHITE, font: "Arial", size: 20 })] })]
  });
}

function cell(text, width, opts = {}) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    children: [new Paragraph({
      children: [new TextRun({ text, font: "Arial", size: 20, bold: opts.bold, color: opts.color })]
    })]
  });
}

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD, space: 8 } },
    children: [new TextRun({ text, bold: true, font: "Arial", size: 32, color: NAVY })]
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 160 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: 26, color: NAVY })]
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: 22, color: TEAL })]
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after || 120 },
    children: [new TextRun({ text, font: "Arial", size: 20, ...opts })]
  });
}

function bulletItem(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 20 })]
  });
}

function numberItem(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "numbers", level },
    spacing: { after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 20 })]
  });
}

function emptyLine() {
  return new Paragraph({ spacing: { after: 120 }, children: [] });
}

// ========================================
// DOCUMENT CONTENT
// ========================================

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 20 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: NAVY },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: NAVY },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: TEAL },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
      ]},
      { reference: "numbers", levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.DECIMAL, text: "%2)", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
      ]},
    ]
  },
  sections: [
    // ======== COVER PAGE ========
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: [
        emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GOLD, space: 16 } },
          children: [new TextRun({ text: "MKT Process", font: "Arial", size: 56, bold: true, color: NAVY })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [new TextRun({ text: "Marketing Process Management System", font: "Arial", size: 28, color: GRAY })]
        }),
        emptyLine(), emptyLine(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [new TextRun({ text: "System Guide & User Manual", font: "Arial", size: 36, bold: true, color: NAVY })]
        }),
        emptyLine(), emptyLine(), emptyLine(), emptyLine(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Promega Korea - Marketing Services Team", font: "Arial", size: 22, color: GRAY })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Version 1.0 | March 2026", font: "Arial", size: 20, color: GRAY })]
        }),
      ]
    },

    // ======== MAIN CONTENT ========
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: GOLD, space: 4 } },
            children: [
              new TextRun({ text: "MKT Process - System Guide", font: "Arial", size: 16, color: GRAY }),
            ],
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Promega Korea | Confidential | Page ", font: "Arial", size: 16, color: GRAY }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: GRAY }),
            ]
          })]
        })
      },
      children: [
        // ======== 1. SYSTEM OVERVIEW ========
        heading1("1. System Overview"),
        para("MKT Process는 Promega Korea Marketing Services 팀의 마케팅 자료 제작 프로세스를 관리하는 웹 기반 시스템입니다."),
        emptyLine(),
        heading3("주요 기능"),
        bulletItem("학회/이벤트별 프로젝트 관리 (Conferences)"),
        bulletItem("독립 요청 관리 (Requests) - 학회와 무관한 브로셔, 인쇄물 등"),
        bulletItem("10단계 워크플로우를 통한 체계적인 프로세스 관리"),
        bulletItem("파일 버전 관리 및 수정본 업로드"),
        bulletItem("협력업체(Agency) 포털 - 견적/제작 진행"),
        bulletItem("Brand Assets 라이브러리 - 완료된 파일 자동 아카이빙"),
        bulletItem("KANBAN Board / Gantt Chart를 통한 시각적 진행 관리"),
        bulletItem("비용 관리 (Cost Management)"),
        emptyLine(),
        heading3("접속 정보"),
        bulletItem("URL: https://promega-mpms.vercel.app"),
        bulletItem("지원 브라우저: Chrome, Edge, Safari (최신 버전)"),

        // ======== 2. USER ROLES ========
        new Paragraph({ children: [new PageBreak()] }),
        heading1("2. User Roles (사용자 역할)"),
        para("시스템은 5가지 역할로 구분되며, 각 역할에 따라 접근 가능한 기능이 다릅니다."),
        emptyLine(),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [1500, 2200, 5660],
          rows: [
            new TableRow({ children: [headerCell("Role", 1500), headerCell("대상", 2200), headerCell("권한", 5660)] }),
            new TableRow({ children: [
              cell("Admin", 1500, { bold: true, color: NAVY }),
              cell("시스템 관리자", 2200),
              cell("모든 기능 접근 + Admin 역할 부여 가능", 5660),
            ]}),
            new TableRow({ children: [
              cell("MS Manager", 1500, { bold: true, color: NAVY }),
              cell("MS 팀장", 2200),
              cell("모든 기능 접근, 사용자 승인/관리, 긴급 상태 변경", 5660),
            ]}),
            new TableRow({ children: [
              cell("MS Staff", 1500, { bold: true }),
              cell("MS 담당자", 2200),
              cell("프로젝트 관리, 파일 관리, 비용 관리, 협력업체 조율", 5660),
            ]}),
            new TableRow({ children: [
              cell("User", 1500, { bold: true }),
              cell("Sales Ops 등 요청자", 2200),
              cell("프로젝트/학회 등록, 파일 업로드, 검토/승인", 5660),
            ]}),
            new TableRow({ children: [
              cell("Agency", 1500, { bold: true }),
              cell("협력업체", 2200),
              cell("할당된 프로젝트만 열람, 견적서/세금계산서 제출, 파일 업로드", 5660),
            ]}),
          ]
        }),

        // ======== 3. SIGN UP & APPROVAL ========
        emptyLine(),
        heading1("3. Sign Up & Approval (가입 및 승인)"),
        heading2("3.1 회원가입"),
        numberItem("https://promega-mpms.vercel.app 접속"),
        numberItem("\"Sign Up\" 클릭"),
        numberItem("이름, 역할(User/MS Staff/MS Manager/Agency), 이메일, 비밀번호 입력"),
        numberItem("Agency 역할 선택 시 회사명 입력 필수"),
        numberItem("\"Sign Up\" 버튼 클릭"),
        emptyLine(),
        heading2("3.2 승인 대기"),
        para("회원가입 후 \"승인 대기 중\" 화면이 표시됩니다. Admin 또는 MS Manager가 승인해야 시스템을 사용할 수 있습니다."),
        emptyLine(),
        heading2("3.3 사용자 승인 (Admin/MS Manager)"),
        numberItem("Users 메뉴 접속"),
        numberItem("\"승인 대기 중\" 섹션에서 대기 중인 사용자 확인"),
        numberItem("\"승인\" 또는 \"거절\" 버튼 클릭"),
        numberItem("승인된 사용자는 즉시 시스템 사용 가능"),

        // ======== 4. MAIN FEATURES ========
        new Paragraph({ children: [new PageBreak()] }),
        heading1("4. Main Features (주요 기능)"),

        heading2("4.1 Dashboard"),
        para("로그인 후 첫 화면입니다. 전체 프로젝트 현황을 한눈에 확인할 수 있습니다."),
        bulletItem("Active Projects / Total / Overdue / Due Soon 카운트"),
        bulletItem("Track별 진행 현황"),
        bulletItem("마감 임박 프로젝트 알림"),
        emptyLine(),

        heading2("4.2 Conferences (학회 관리)"),
        para("학회/이벤트를 등록하고, 학회별 프로젝트(Booth, Banner, Giveaway 등)를 관리합니다."),
        bulletItem("New Conference: 학회명, 날짜, 장소, 예산 입력"),
        bulletItem("학회 카드 클릭 > Add Project > Track 유형 선택"),
        bulletItem("검색, 상태 필터, 연도 필터 지원"),
        emptyLine(),

        heading2("4.3 Requests (독립 요청)"),
        para("학회와 무관한 브로셔, Literature 등의 제작 요청을 관리합니다."),
        bulletItem("New Request: 제목, Track 유형, 마감일, 설명 입력"),
        bulletItem("검색, 상태 필터, Track 필터 지원"),
        emptyLine(),

        heading2("4.4 KANBAN Board"),
        para("모든 프로젝트를 상태별 컬럼으로 시각화합니다. 드래그로 상태 변경은 불가하며, 프로젝트 카드 클릭으로 상세 페이지로 이동합니다."),
        emptyLine(),

        heading2("4.5 Gantt Chart"),
        para("프로젝트 타임라인을 시각적으로 확인합니다. Day/Week/Month 뷰를 전환할 수 있습니다."),
        emptyLine(),

        heading2("4.6 Cost Management"),
        para("프로젝트별 비용을 등록하고 관리합니다. MS Staff/Manager만 접근 가능합니다."),
        emptyLine(),

        heading2("4.7 Brand Assets"),
        para("브랜드 자산(로고, 가이드라인, 템플릿)과 프로젝트 완료 시 아카이빙된 파일을 관리합니다."),
        bulletItem("카테고리별 분류: Logo, Color, Template, Font, Guideline, Released Files, Other"),
        bulletItem("이미지 미리보기 지원"),
        bulletItem("프로젝트 완료 시 선택한 파일이 자동으로 Released Files에 저장"),
        bulletItem("새 프로젝트에서 \"Import from Brand Assets\"로 기존 파일 재사용 가능"),
        emptyLine(),

        heading2("4.8 User Management"),
        para("Admin/MS Manager만 접근 가능합니다."),
        bulletItem("신규 사용자 승인/거절"),
        bulletItem("역할 변경"),
        bulletItem("사용자 삭제"),
        bulletItem("Admin만 Admin 역할 부여 가능"),

        // ======== 5. 10-STAGE WORKFLOW ========
        new Paragraph({ children: [new PageBreak()] }),
        heading1("5. 10-Stage Workflow (10단계 워크플로우)"),
        para("모든 프로젝트는 다음 10단계를 거쳐 진행됩니다. 각 단계에서 역할별로 수행할 수 있는 액션이 다릅니다."),
        emptyLine(),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [500, 1800, 4560, 2500],
          rows: [
            new TableRow({ children: [headerCell("#", 500), headerCell("Stage", 1800), headerCell("Description", 4560), headerCell("Action By", 2500)] }),
            new TableRow({ children: [cell("1", 500), cell("Draft", 1800, { bold: true }), cell("프로젝트 생성, 초안 파일 업로드", 4560), cell("User / MS", 2500)] }),
            new TableRow({ children: [cell("2", 500), cell("MS Review", 1800, { bold: true }), cell("MS팀이 검토, 필요시 수정본 업로드", 4560), cell("MS Staff/Manager", 2500)] }),
            new TableRow({ children: [cell("3", 500), cell("User Review", 1800, { bold: true }), cell("User에게 수정본 검토 요청 (생략 가능)", 4560), cell("User", 2500)] }),
            new TableRow({ children: [cell("4", 500), cell("Quotation Request", 1800, { bold: true }), cell("협력업체 선택 후 견적 요청 발송", 4560), cell("MS > Agency", 2500)] }),
            new TableRow({ children: [cell("5", 500), cell("Quotation Received", 1800, { bold: true }), cell("Agency가 견적서 제출", 4560), cell("Agency", 2500)] }),
            new TableRow({ children: [cell("6", 500), cell("Quotation Approved", 1800, { bold: true }), cell("User/MS가 견적 승인 또는 반려", 4560), cell("User / MS", 2500)] }),
            new TableRow({ children: [cell("7", 500), cell("Released", 1800, { bold: true }), cell("최종 문서 릴리즈, 입고 요청일 입력", 4560), cell("MS Staff/Manager", 2500)] }),
            new TableRow({ children: [cell("8", 500), cell("In Production", 1800, { bold: true }), cell("협력업체 제작 진행, 입고 예정일 수정 가능", 4560), cell("Agency", 2500)] }),
            new TableRow({ children: [cell("9", 500), cell("Invoice", 1800, { bold: true }), cell("세금계산서 제출", 4560), cell("Agency / MS", 2500)] }),
            new TableRow({ children: [cell("10", 500), cell("Completed", 1800, { bold: true }), cell("프로젝트 완료, Brand Assets에 파일 아카이빙", 4560), cell("User / MS", 2500)] }),
          ]
        }),

        // ======== 6. FILE MANAGEMENT ========
        emptyLine(),
        heading1("6. File Management (파일 관리)"),

        heading2("6.1 파일 업로드"),
        bulletItem("Drag & Drop: 파일을 드래그하여 업로드 영역에 놓기"),
        bulletItem("New File: 버튼 클릭 후 파일 선택"),
        bulletItem("Import from Brand Assets: 기존 Brand Assets에서 파일 가져오기"),
        emptyLine(),

        heading2("6.2 수정본 업로드 (Upload Revision)"),
        para("기존 파일의 수정본을 업로드하면 자동으로 버전이 증가합니다 (v1 > v2 > v3...)."),
        numberItem("\"Upload Revision\" 버튼 클릭"),
        numberItem("교체할 기존 파일 선택"),
        numberItem("\"파일 찾기\" 버튼으로 수정본 파일 선택"),
        numberItem("\"수정본 업로드\" 클릭"),
        para("기본적으로 최신 버전만 표시되며, \"+N older\" 클릭으로 이전 버전 확인 가능합니다."),
        emptyLine(),

        heading2("6.3 파일 삭제"),
        bulletItem("Admin/MS Staff/Manager: 모든 파일 삭제 가능"),
        bulletItem("User/Agency: 본인이 업로드한 파일만 삭제 가능"),

        // ======== 7. SCENARIO ========
        new Paragraph({ children: [new PageBreak()] }),
        heading1("7. Workflow Scenario (시나리오)"),
        para("아래는 학회 부스 제작을 위한 전체 워크플로우 시나리오입니다.", { bold: true }),
        emptyLine(),

        heading3("Scenario: KSBMB 2026 학회 부스 제작"),
        emptyLine(),

        para("Step 1: Draft (User - Sales Ops 김과장)", { bold: true, color: NAVY }),
        numberItem("Conferences > New Conference > \"KSBMB 2026\" 등록"),
        numberItem("학회 상세 > Add Project > Track: Booth/Wall, Title: \"부스 제작\""),
        numberItem("초안 디자인 파일 드래그하여 업로드"),
        numberItem("\"MS팀에 제출\" 버튼 클릭 > Status: MS Review로 이동"),
        emptyLine(),

        para("Step 2: MS Review (MS Staff 이대리)", { bold: true, color: NAVY }),
        numberItem("Dashboard에서 새 프로젝트 확인"),
        numberItem("파일 다운로드 후 검토"),
        numberItem("수정이 필요한 경우 \"Upload Revision\"으로 수정본 업로드"),
        numberItem("\"User 검토 요청\" 또는 \"User 검토 생략 > 견적 요청\" 선택"),
        emptyLine(),

        para("Step 3: User Review (User - 김과장) [선택적]", { bold: true, color: NAVY }),
        numberItem("수정본 확인 후 \"승인 > 견적 요청\" 또는 \"수정 요청\""),
        emptyLine(),

        para("Step 4: Quotation Request (MS > Agency)", { bold: true, color: NAVY }),
        numberItem("협력업체 선택 다이얼로그에서 업체 선택"),
        numberItem("견적 요청 발송 > Agency에게 프로젝트 공개"),
        emptyLine(),

        para("Step 5: Quotation Received (Agency - 박사장)", { bold: true, color: NAVY }),
        numberItem("Agency Portal Dashboard에서 프로젝트 확인"),
        numberItem("견적서 파일 업로드"),
        numberItem("\"견적서 제출\" 버튼 클릭"),
        emptyLine(),

        para("Step 6: Quotation Approved (User/MS)", { bold: true, color: NAVY }),
        numberItem("견적서 검토 후 \"견적 승인\" 또는 \"견적 반려\""),
        emptyLine(),

        para("Step 7: Released (MS Staff)", { bold: true, color: NAVY }),
        numberItem("\"제작 시작\" 클릭 > 입고 요청일 입력"),
        numberItem("Agency에게 제작 시작 알림"),
        emptyLine(),

        para("Step 8: In Production (Agency)", { bold: true, color: NAVY }),
        numberItem("제작 진행, 필요시 입고 예정일 수정"),
        numberItem("제작 완료 후 세금계산서 준비"),
        emptyLine(),

        para("Step 9: Invoice (Agency/MS)", { bold: true, color: NAVY }),
        numberItem("세금계산서 파일 업로드"),
        numberItem("\"세금계산서 제출\" 클릭"),
        emptyLine(),

        para("Step 10: Completed (User/MS)", { bold: true, color: NAVY }),
        numberItem("\"프로젝트 완료\" 클릭"),
        numberItem("Brand Assets에 저장할 파일 선택 (견적서/세금계산서 자동 제외)"),
        numberItem("선택한 파일이 Brand Assets > Released Files에 자동 아카이빙"),
        numberItem("프로젝트 완료!"),

        // ======== 8. AGENCY PORTAL ========
        new Paragraph({ children: [new PageBreak()] }),
        heading1("8. Agency Portal (협력업체 포털)"),
        para("Agency 역할로 로그인하면 전용 포털이 표시됩니다."),
        emptyLine(),
        heading3("Agency가 볼 수 있는 것"),
        bulletItem("Quotation Request 단계 이후의 프로젝트만 표시"),
        bulletItem("Dashboard: 할당된 프로젝트 목록, 진행 현황"),
        bulletItem("KANBAN Board: 할당된 프로젝트의 상태별 현황"),
        bulletItem("Brand Assets: 공용 브랜드 자산 열람"),
        emptyLine(),
        heading3("Agency가 볼 수 없는 것"),
        bulletItem("Draft ~ User Review 단계의 내부 진행 과정"),
        bulletItem("Activity Log (내부 로그)"),
        bulletItem("파일 이전 버전 히스토리"),
        bulletItem("Conferences, Gantt Chart, Cost Management"),
        emptyLine(),
        heading3("Agency가 할 수 있는 것"),
        bulletItem("파일 업로드 (견적서, 세금계산서 등)"),
        bulletItem("본인이 올린 파일 삭제"),
        bulletItem("견적서 제출 / 세금계산서 제출 버튼 사용"),
        bulletItem("Comments 탭에서 코멘트 작성"),

        // ======== 9. NOTIFICATIONS ========
        emptyLine(),
        heading1("9. Notifications (알림)"),
        para("상단 오른쪽 알림 벨 아이콘을 통해 알림을 확인합니다."),
        bulletItem("프로젝트 상태 변경 시 관련 사용자에게 알림"),
        bulletItem("파일 업로드 시 프로젝트 참여자에게 알림"),
        bulletItem("읽지 않은 알림 수가 벨 아이콘 옆에 표시"),
        bulletItem("알림 클릭 시 해당 프로젝트로 이동"),

        // ======== 10. FAQ ========
        emptyLine(),
        heading1("10. FAQ"),
        emptyLine(),
        para("Q: 비밀번호를 잊었습니다.", { bold: true }),
        para("A: Admin 또는 MS Manager에게 문의하여 계정을 초기화하세요."),
        emptyLine(),
        para("Q: 파일 업로드 시 에러가 발생합니다.", { bold: true }),
        para("A: 파일명에 특수문자가 포함되면 자동으로 영문으로 변환됩니다. 파일 크기 제한은 50MB입니다."),
        emptyLine(),
        para("Q: Agency인데 프로젝트가 보이지 않습니다.", { bold: true }),
        para("A: Quotation Request 단계 이후부터 프로젝트가 표시됩니다. MS팀에서 견적 요청을 발송해야 합니다."),
        emptyLine(),
        para("Q: 이전 버전 파일을 다운로드하고 싶습니다.", { bold: true }),
        para("A: 파일명 옆의 \"+N older\" 링크를 클릭하면 이전 버전이 펼쳐지고, 각 버전을 다운로드할 수 있습니다."),
        emptyLine(),
        para("Q: 완료된 프로젝트의 파일을 찾고 싶습니다.", { bold: true }),
        para("A: Brand Assets > Released Files 탭에서 아카이빙된 파일을 검색할 수 있습니다."),
      ]
    }
  ]
});

// Generate
Packer.toBuffer(doc).then(buffer => {
  const outputPath = "C:/Marketing process management system/docs/MKT_Process_System_Guide_v1.0.docx";
  fs.writeFileSync(outputPath, buffer);
  console.log("Document generated:", outputPath);
});

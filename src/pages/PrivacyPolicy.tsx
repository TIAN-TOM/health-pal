import LegalPage from '@/components/legal/LegalPage';

const zh = (
  <>
    <h2>一、引言</h2>
    <p>
      "健康生活伴侣"（以下简称"本应用"）非常重视您的个人信息保护。本政策说明我们收集、使用、存储和共享您个人信息的方式，以及您享有的权利。请您在使用本应用前仔细阅读并理解本政策。
    </p>

    <h2>二、我们收集的信息</h2>
    <ul>
      <li><strong>账户信息：</strong>邮箱地址、姓名、出生日期、性别、身高体重等基本资料。</li>
      <li><strong>健康数据：</strong>您自行录入的血糖、血压、症状、用药、饮食、运动、睡眠、情绪等记录。</li>
      <li><strong>家庭协作信息：</strong>您主动添加的家庭成员姓名、关系、生日、提醒事项与费用记录。</li>
      <li><strong>位置信息：</strong>仅在您主动查询天气时使用浏览器定位 API 获取大致位置，用完即丢，不入库。</li>
      <li><strong>设备与日志：</strong>浏览器型号、操作系统、错误堆栈（用于排障，匿名化处理）。</li>
    </ul>

    <h2>三、信息使用方式</h2>
    <ul>
      <li>为您提供健康记录、统计、提醒、家庭协作、积分商城等核心功能。</li>
      <li>用于数据导出，便于您交付医生或 AI 助手参考。</li>
      <li>用于安全审计、异常登录检测与产品质量改进。</li>
      <li>未经您明示同意，我们不会将您的健康数据用于广告、营销或转售。</li>
    </ul>

    <h2>四、数据存储与安全</h2>
    <p>
      您的数据存储于 Supabase 托管的 PostgreSQL 数据库（默认部署区域：新加坡）。我们采用行级安全策略（RLS）、JWT 鉴权、HTTPS 传输加密、私有存储桶等措施保障数据安全。即便如此，互联网传输不存在绝对安全，请您妥善保管账号密码。
    </p>

    <h2>五、第三方服务</h2>
    <ul>
      <li><strong>Supabase</strong>：数据库、身份认证、对象存储、边缘函数。</li>
      <li><strong>Open-Meteo</strong>：天气与空气质量数据查询（不向其发送您的身份信息）。</li>
      <li><strong>Resend</strong>：在管理员通知与账号验证场景发送邮件。</li>
    </ul>

    <h2>六、您的权利</h2>
    <ul>
      <li><strong>访问与导出：</strong>"整理记录给医生/AI" 入口可导出您的全部记录为 JSON/文本。</li>
      <li><strong>更正：</strong>可在"个人资料"中随时修改。</li>
      <li><strong>删除/注销：</strong>设置 → 账号管理 → 注销账号，将永久删除您的账号与全部相关数据。</li>
      <li><strong>撤回同意：</strong>您可随时停止使用本应用，注销账号即视为撤回授权。</li>
    </ul>

    <h2>七、未成年人保护</h2>
    <p>
      本应用不面向未满 14 周岁的未成年人。如您为未成年人，请在监护人陪同下使用，并由监护人代为同意本政策。
    </p>

    <h2>八、政策更新</h2>
    <p>本政策可能不定期更新，重要变更将在应用内显著位置告知。</p>

    <h2>九、联系我们</h2>
    <p>
      如对本政策有任何疑问，请通过 GitHub Issue 或开发者 LinkedIn 与我们联系：
      <br />
      <a href="https://github.com/TIAN-TOM" target="_blank" rel="noopener noreferrer">github.com/TIAN-TOM</a>
    </p>
  </>
);

const en = (
  <>
    <h2>1. Introduction</h2>
    <p>
      Health Pal ("the App") respects your privacy. This Policy explains what personal data we collect, how we use it, who we share it with, and the rights you have. Please read it carefully before using the App.
    </p>

    <h2>2. Information We Collect</h2>
    <ul>
      <li><strong>Account data:</strong> email, name, date of birth, gender, height/weight.</li>
      <li><strong>Health data you enter:</strong> glucose, blood pressure, symptoms, medication, diet, exercise, sleep, mood.</li>
      <li><strong>Family data you add:</strong> family member name, relation, birthday, reminders, expenses.</li>
      <li><strong>Location:</strong> only used transiently via the browser Geolocation API when you request weather; not stored.</li>
      <li><strong>Device & logs:</strong> browser, OS, anonymized error stack traces for diagnostics.</li>
    </ul>

    <h2>3. How We Use Information</h2>
    <ul>
      <li>Provide health tracking, statistics, reminders, family collaboration and the points store.</li>
      <li>Generate data exports you can hand to a doctor or AI assistant.</li>
      <li>Security auditing, anomaly detection and product improvement.</li>
      <li>We do not sell your health data or use it for advertising without your explicit consent.</li>
    </ul>

    <h2>4. Storage & Security</h2>
    <p>
      Data is stored in a Supabase-managed PostgreSQL database (default region: Singapore). We rely on Row Level Security, JWT authentication, TLS in transit and private storage buckets. No internet system is perfectly secure — please protect your credentials.
    </p>

    <h2>5. Third-Party Services</h2>
    <ul>
      <li><strong>Supabase</strong>: database, auth, storage, edge functions.</li>
      <li><strong>Open-Meteo</strong>: weather & air-quality data (no identity sent).</li>
      <li><strong>Resend</strong>: transactional emails for admin notifications and verification.</li>
    </ul>

    <h2>6. Your Rights (GDPR / PIPL)</h2>
    <ul>
      <li><strong>Access / Export:</strong> "Export records for doctor / AI" gives you all your data as JSON/text.</li>
      <li><strong>Rectify:</strong> edit anytime in your profile.</li>
      <li><strong>Erasure:</strong> Settings → Account → Delete Account permanently erases your account and all related data.</li>
      <li><strong>Withdraw consent:</strong> stopping use of the App and deleting your account withdraws your consent.</li>
    </ul>

    <h2>7. Children</h2>
    <p>The App is not intended for children under 14. Minors must use it under guardian supervision and with guardian consent.</p>

    <h2>8. Updates</h2>
    <p>This Policy may be updated; material changes will be highlighted inside the App.</p>

    <h2>9. Contact</h2>
    <p>
      Questions? Reach us via GitHub or LinkedIn:
      <br />
      <a href="https://github.com/TIAN-TOM" target="_blank" rel="noopener noreferrer">github.com/TIAN-TOM</a>
    </p>
  </>
);

const PrivacyPolicy = () => (
  <LegalPage title="隐私政策" titleEn="Privacy Policy" content={zh} contentEn={en} />
);

export default PrivacyPolicy;

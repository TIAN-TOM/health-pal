import LegalPage from '@/components/legal/LegalPage';

const zh = (
  <>
    <h2>一、协议接受</h2>
    <p>
      欢迎使用"健康生活伴侣"。当您注册账号、勾选同意或继续使用本应用，即视为您已阅读、理解并同意本服务协议（以下简称"本协议"）及《隐私政策》《医疗免责声明》的全部内容。
    </p>

    <h2>二、服务内容</h2>
    <p>
      本应用为您提供个人健康数据记录、家庭健康协作、积分激励、健康教育内容浏览、轻量小游戏等功能。具体功能可能根据产品迭代调整，恕不另行通知。
    </p>

    <h2>三、账号与安全</h2>
    <ul>
      <li>您应使用真实有效的邮箱注册，并妥善保管账号与密码。</li>
      <li>因您主动泄露、转借账号造成的损失，由您本人承担。</li>
      <li>如发现账号被盗用，请立即通过"忘记密码"重置或联系开发者。</li>
    </ul>

    <h2>四、用户行为规范</h2>
    <p>您承诺在使用本应用时不得：</p>
    <ul>
      <li>上传违法、淫秽、暴力、侵犯他人合法权益的内容；</li>
      <li>对本应用进行反向工程、自动化爬取或干扰服务器；</li>
      <li>利用本应用从事非法医疗行为或医疗广告；</li>
      <li>恶意刷取积分、虚假打卡或破坏积分商城公平性。</li>
    </ul>

    <h2>五、知识产权</h2>
    <p>本应用代码、UI、文案、教育内容（除注明转载外）著作权归开发者所有；您录入的健康数据所有权归您本人。</p>

    <h2>六、免责</h2>
    <ul>
      <li>本应用不是医疗器械软件，所有信息仅供日常自我管理参考，不构成诊断、治疗或用药建议。</li>
      <li>因您依赖本应用信息作出健康决策导致的任何后果，由您自行承担。</li>
      <li>因网络故障、不可抗力造成的服务中断，开发者不承担赔偿责任。</li>
    </ul>

    <h2>七、协议变更与终止</h2>
    <p>开发者有权根据法律法规变化或产品需要更新本协议；您可随时通过注销账号终止本协议。</p>

    <h2>八、争议解决</h2>
    <p>本协议适用中华人民共和国法律。若发生争议，双方应友好协商；协商不成的，提交开发者所在地有管辖权的法院诉讼解决。</p>
  </>
);

const en = (
  <>
    <h2>1. Acceptance</h2>
    <p>By registering, ticking the consent checkbox, or continuing to use Health Pal, you agree to this Terms of Service, the Privacy Policy and the Medical Disclaimer.</p>

    <h2>2. Service</h2>
    <p>The App provides personal health tracking, family collaboration, points incentives, educational content browsing and lightweight games. Features may change over time without prior notice.</p>

    <h2>3. Account & Security</h2>
    <ul>
      <li>Use a valid email and safeguard your credentials.</li>
      <li>You bear losses caused by sharing or leaking your account.</li>
      <li>If your account is compromised, reset the password immediately or contact the developer.</li>
    </ul>

    <h2>4. Acceptable Use</h2>
    <ul>
      <li>No illegal, obscene, violent or rights-infringing content.</li>
      <li>No reverse engineering, scraping or service disruption.</li>
      <li>No medical malpractice or unauthorized medical advertising.</li>
      <li>No fraudulent check-ins or abuse of the points system.</li>
    </ul>

    <h2>5. Intellectual Property</h2>
    <p>Code, UI, copy and educational content (unless otherwise noted) belong to the developer; your own health records belong to you.</p>

    <h2>6. Disclaimer</h2>
    <ul>
      <li>The App is not a medical device. All information is for self-management reference only and is not a diagnosis, treatment or prescription.</li>
      <li>You bear all consequences of health decisions made in reliance on the App.</li>
      <li>The developer is not liable for service interruptions caused by network failure or force majeure.</li>
    </ul>

    <h2>7. Changes & Termination</h2>
    <p>The developer may update these Terms in line with regulations or product needs. You may terminate at any time by deleting your account.</p>

    <h2>8. Governing Law</h2>
    <p>These Terms are governed by the laws of the People's Republic of China. Disputes shall first be resolved amicably; otherwise submitted to the competent court in the developer's jurisdiction.</p>
  </>
);

const TermsOfService = () => (
  <LegalPage title="用户服务协议" titleEn="Terms of Service" content={zh} contentEn={en} />
);

export default TermsOfService;

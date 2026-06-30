import LegalPage from '@/components/legal/LegalPage';

const zh = (
  <>
    <div className="border-l-4 border-red-500 bg-red-50 p-3 mb-4 not-prose">
      <p className="text-sm text-red-700 font-semibold m-0">
        ⚠️ 重要：本应用并非医疗器械软件，不能替代医生诊断或专业治疗建议。
      </p>
    </div>

    <h2>一、应用性质</h2>
    <p>
      "健康生活伴侣"是一款个人健康数据记录与生活方式管理工具，提供数据录入、统计图表、提醒、教育内容浏览等功能。本应用<strong>不属于</strong>《医疗器械监督管理条例》定义的医疗器械软件，<strong>未取得</strong>任何医疗器械注册证。
    </p>

    <h2>二、信息用途限制</h2>
    <ul>
      <li>应用内的血糖目标值、参考区间、健康建议、教育文章等均为<strong>科普性参考资料</strong>，不构成针对您个人情况的医学意见。</li>
      <li>所有数据由您本人手动录入，本应用不对数据的准确性进行医学校验。</li>
      <li>本应用提供的提醒（吃药、复诊、打卡等）仅为日常辅助，不能替代医生医嘱。</li>
    </ul>

    <h2>三、紧急情况处置</h2>
    <p>
      如您正在经历以下任一情况，请<strong>立即停止使用本应用并拨打急救电话（中国大陆 120 / 中国香港 999 / 美国 911 / 澳洲 000）</strong>，或前往最近的急诊：
    </p>
    <ul>
      <li>胸闷、胸痛、呼吸困难、意识模糊</li>
      <li>严重眩晕伴随呕吐、视物模糊、肢体无力</li>
      <li>血糖低于 3.9 mmol/L 且伴随明显症状</li>
      <li>持续高热、剧烈头痛、抽搐</li>
      <li>任何您认为危及生命的状况</li>
    </ul>

    <h2>四、不替代专业医疗</h2>
    <p>
      您不应仅凭本应用的数据或提示自行：
    </p>
    <ul>
      <li>调整、增减或停止任何处方药物；</li>
      <li>替代复诊、化验、影像等临床检查；</li>
      <li>对自己或家人作出诊断结论。</li>
    </ul>
    <p>任何健康决策都应事先咨询具备执业资质的医生。</p>

    <h2>五、责任限制</h2>
    <p>
      在法律允许的最大范围内，开发者对您因使用本应用信息所作健康决策导致的任何直接或间接损失不承担赔偿责任。
    </p>

    <h2>六、确认</h2>
    <p>当您继续使用本应用，即表示您已充分理解并接受本免责声明。</p>
  </>
);

const en = (
  <>
    <div className="border-l-4 border-red-500 bg-red-50 p-3 mb-4 not-prose">
      <p className="text-sm text-red-700 font-semibold m-0">
        ⚠️ Important: Health Pal is NOT a medical device and is not a substitute for diagnosis or professional treatment.
      </p>
    </div>

    <h2>1. Nature of the App</h2>
    <p>
      Health Pal is a personal health tracker and lifestyle tool offering data entry, charts, reminders and educational content. It is <strong>not</strong> regulated medical-device software and has <strong>not</strong> been certified by any medical-device authority.
    </p>

    <h2>2. Limits of the Information</h2>
    <ul>
      <li>Reference ranges, targets, tips and articles are <strong>educational references only</strong> and are not personal medical advice.</li>
      <li>All data is self-entered; the App does not clinically validate accuracy.</li>
      <li>Reminders (medication, follow-ups, check-ins) are convenience aids, not doctor's orders.</li>
    </ul>

    <h2>3. Emergencies</h2>
    <p>
      If you experience any of the following, <strong>stop using the App and call emergency services immediately</strong> (mainland China 120 / Hong Kong 999 / US 911 / Australia 000) or go to the nearest ER:
    </p>
    <ul>
      <li>Chest pain, breathing difficulty, confusion</li>
      <li>Severe vertigo with vomiting, blurred vision or weakness</li>
      <li>Blood glucose below 3.9 mmol/L with symptoms</li>
      <li>Persistent high fever, severe headache, seizures</li>
      <li>Any condition you believe is life-threatening</li>
    </ul>

    <h2>4. Not a Substitute for Medical Care</h2>
    <p>Do not, based solely on the App, decide to:</p>
    <ul>
      <li>Start, stop or change prescription medication;</li>
      <li>Skip clinical tests, imaging or follow-up visits;</li>
      <li>Self-diagnose or diagnose family members.</li>
    </ul>
    <p>Always consult a licensed clinician for any health decision.</p>

    <h2>5. Limitation of Liability</h2>
    <p>To the maximum extent permitted by law, the developer is not liable for losses arising from your reliance on the App.</p>

    <h2>6. Acknowledgement</h2>
    <p>Continued use of the App means you accept this Medical Disclaimer in full.</p>
  </>
);

const MedicalDisclaimer = () => (
  <LegalPage title="医疗免责声明" titleEn="Medical Disclaimer" content={zh} contentEn={en} />
);

export default MedicalDisclaimer;

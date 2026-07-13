const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. REPAIR HELPER FUNCTIONS BLOCK
const helperTargetStart = '  const [currentSt                  {/* PROFESSIONAL';
const helperTargetEnd = '</div>e.thumbnail && (externalEditingArticle.thumbnail.startsWith("http://") || externalEditingArticle.thumbnail.startsWith("https://"))) {';

const startIndex1 = code.indexOf(helperTargetStart);
const endIndex1 = code.indexOf(helperTargetEnd);

if (startIndex1 !== -1 && endIndex1 !== -1) {
  console.log('Found helper corrupted block at index', startIndex1, 'to', endIndex1);
  
  const helperRestored = `  const [currentStep, setCurrentStep] = useState<number>(1);
  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };
  const handleNextStep = () => {
    if (currentStep < 3) setCurrentStep(prev => prev + 1);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);

  const processAndSetFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPostData((prev) => ({
        ...prev,
        thumbnail: reader.result as string,
        thumbnailName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndSetFile(file);
    }
  };

  const handleGenerateImageUser = async () => {
    if (!postData.title) {
      toast.error("기사 제목을 입력하시면 제목 맞춤형 정밀 이미지가 생성됩니다.");
      return;
    }
    setIsGeneratingImageUser(true);
    const toastId = toast.loading("AI가 정론보도 규격 일러스트를 드로잉하는 중...");
    try {
      const generatedUrl = \`https://image.pollinations.ai/prompt/\${encodeURIComponent(postData.title + " newspaper photography high quality, professional journalistic photo")}?nologo=true&seed=\${Math.floor(Math.random() * 100000)}\`;
      setPostData((prev) => ({
        ...prev,
        thumbnail: generatedUrl,
        thumbnailName: "AI_Generated_Press_Image.jpg",
      }));
      toast.success("✨ AI 보도 이미지가 정밀하게 렌더링되어 삽입되었습니다!", { id: toastId });
    } catch (e) {
      toast.error("이미지 생성에 실패했습니다.", { id: toastId });
    } finally {
      setIsGeneratingImageUser(false);
    }
  };

  const handleGenerateImageAdmin = async () => {
    if (!inlineForm.title) {
      toast.error("기사 제목을 입력하시면 제목 맞춤형 이미지가 생성됩니다.");
      return;
    }
    setIsGeneratingImageAdmin(true);
    const toastId = toast.loading("AI 어드민 에디토리얼 이미지 생성 중...");
    try {
      const generatedUrl = \`https://image.pollinations.ai/prompt/\${encodeURIComponent(inlineForm.title + " professional news photo")}?nologo=true&seed=\${Math.floor(Math.random() * 100000)}\`;
      setInlineForm((prev) => ({
        ...prev,
        thumbnail: generatedUrl,
      }));
      toast.success("✨ 어드민 교정용 대표 이미지가 생성되었습니다!", { id: toastId });
    } catch (e) {
      toast.error("이미지 생성에 실패했습니다.", { id: toastId });
    } finally {
      setIsGeneratingImageAdmin(false);
    }
  };

  const handleCleanContentFormatting = () => {
    setIsCleaningContent(true);
    setTimeout(() => {
      let cleaned = postData.content;
      cleaned = cleaned.replace(/\\n{3,}/g, "\\n\\n");
      cleaned = cleaned.replace(/[ \\t]+$/gm, "");
      cleaned = cleaned.replace(/[ \\t]{2,}/g, " ");
      setPostData(prev => ({ ...prev, content: cleaned }));
      setIsCleaningContent(false);
      toast.success("✨ 모바일 기사 문단 공백 및 줄바꿈 정렬이 완벽하게 정제되었습니다!");
    }, 400);
  };

  useEffect(() => {
    if (externalEditingArticle) {
       setEditingArticle(externalEditingArticle);
       setPostData({
         title: externalEditingArticle.title,
         content: externalEditingArticle.content,
         thumbnail: externalEditingArticle.thumbnail,
         thumbnailName: (externalEditingArticle as any).thumbnailName || (externalEditingArticle.thumbnail ? "기존 대표 이미지" : ""),
         category: externalEditingArticle.category,
         subCategory: externalEditingArticle.subCategory || "",
         pdfUrl: externalEditingArticle.pdfUrl || "",
         pdfName: externalEditingArticle.pdfName || "",
         authorName: externalEditingArticle.author || "",
         authorBio: (externalEditingArticle as any).reporterBio || "",
         sourceAgency: (externalEditingArticle as any).sourceAgency || "이솔 국영 종합 뉴스룸",
         pressSeal: (externalEditingArticle as any).pressSeal || "standard_citizen",
       });
       if (externalEditingArticle.thumbnail && (externalEditingArticle.thumbnail.startsWith("http://") || externalEditingArticle.thumbnail.startsWith("https://"))) {`;

  const part1 = code.slice(0, startIndex1);
  const part2 = code.slice(endIndex1 + helperTargetEnd.length);
  code = part1 + helperRestored + part2;
  console.log('REPAIRED Block 1 (Helper Functions) successfully!');
} else {
  console.log('ERROR: Could not find Block 1 helper functions patterns.');
}

// 2. REPAIR ACTIVE METADATA BLOCK
const metadataTargetStart = '                  {/* PROFESSIONAL PRESS AGENCY METADATA PICKER PANEL (전문언론사처럼 대조 장치) */}';
const metadataTargetEnd = '                        </select>';

// Since we repaired block 1, let's find the active metadata block in the new code
const startIndex2 = code.indexOf(metadataTargetStart);
// Wait, is there any other occurrence above? No, since the first one inside dummyTrashString was deleted, the active one is the only remaining one!
const endIndex2 = code.indexOf(metadataTargetEnd, startIndex2);

if (startIndex2 !== -1 && endIndex2 !== -1) {
  console.log('Found active metadata block at index', startIndex2, 'to', endIndex2);
  
  const metadataRestored = `                  {/* PROFESSIONAL PRESS AGENCY METADATA PICKER PANEL (전문언론사처럼 대조 장치) */}
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3.5 text-left font-sans">
                    <div className="flex items-center gap-1.5 border-b border-zinc-150 dark:border-zinc-800 pb-2">
                      <ShieldCheck size={16} className="text-purple-600 dark:text-purple-400 shrink-0" />
                      <div>
                        <h4 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                          정식 제휴 보도 기조 검증
                        </h4>
                        <p className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase">Verified Publisher</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-450 dark:text-zinc-400">
                        보도 영역 카테고리 지정
                      </label>
                      <select
                        required
                        value={postData.category}
                        onChange={(e) =>
                          setPostData({ ...postData, category: e.target.value, subCategory: "" })
                        }
                        className="w-full bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                      >
                        <option value="">보도 영역 카테고리 선택</option>
                        <option value="사회/정치">⚖️ 사회/정치 (민생현안)</option>
                        <option value="경제/문화">🌱 경제/문화 (비건/원예)</option>
                        <option value="복지/미래비전">🌈 복지/미래비전 (이솔연맹)</option>
                        <option value="팩트체크">🔍 팩트체크 (가짜뉴스 검증)</option>
                        <option value="AI 기사">🤖 AI 기사 (기술 동향)</option>
                        <option value="만평">🎨 만평 (일러스트 보도)</option>
                        <option value="지역">📍 지역 (마을 소식)</option>
                        <option value="이솔공방">🧸 이솔공방 (예술작품 투고)</option>
                        <option value="이솔나라포토">📸 이솔나라포토</option>
                        <option value="이솔나라북">📚 이솔나라북</option>
                        <option value="온에어">🎙️ 온에어</option>
                      </select>
                    </div>

                    {/* PROFESSIONAL PRESS AGENCY METADATA PICKER PANEL (Seals Selection) */}
                    <div className="space-y-1.5 pt-1">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-450 dark:text-zinc-400">
                        정식 보도 등기 및 서명필
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                        {[
                          { id: "standard_citizen", label: "기본 시민인", text: "시민 보도 연합 공인", icon: PenTool },
                          { id: "professional_seal", label: "편집 정식인", text: "전문 제휴 편집필증", icon: ShieldCheck },
                          { id: "special_dispatch", label: "현장 기동인", text: "취재 기동 특필날인", icon: Zap }
                        ].map((seal) => {
                          const isSelected = postData.pressSeal === seal.id;
                          const SealIcon = seal.icon;
                          return (
                            <button
                              key={seal.id}
                              type="button"
                              onClick={() => {
                                if (typeof playHapticClick === "function") playHapticClick(550, 0.05);
                                setPostData({ ...postData, pressSeal: seal.id });
                              }}
                              className={cn(
                                "relative overflow-hidden p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-300 text-center cursor-pointer group active:scale-[0.98]",
                                isSelected
                                  ? "bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400 font-black shadow-inner"
                                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                              )}
                            >
                              {isSelected && (
                                <span className="absolute -right-2 -bottom-2 w-8 h-8 rounded-full border-4 border-orange-500/20 pointer-events-none" />
                              )}
                              <SealIcon size={13} className={isSelected ? "animate-bounce text-orange-500" : "text-zinc-400 group-hover:scale-110 transition-transform"} />
                              <span className="text-[10px] font-black">{seal.label}</span>
                              <span className="text-[8px] font-bold opacity-75">{seal.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>`;

  const part1 = code.slice(0, startIndex2);
  const part2 = code.slice(endIndex2 + metadataTargetEnd.length);
  code = part1 + metadataRestored + part2;
  console.log('REPAIRED Block 2 (Active Metadata Panel) successfully!');
} else {
  console.log('ERROR: Could not find Block 2 active metadata panel patterns.');
}

fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log('All surgical repairs finalized successfully!');

import { db } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  updateDoc
} from "firebase/firestore";

export interface RagDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  active: boolean;
  createdAt: string;
  charCount: number;
  chunkCount: number;
}

export interface RagChunk {
  documentId: string;
  documentTitle: string;
  category: string;
  text: string;
  index: number;
}

/**
 * Text chunker with custom size and overlap
 */
export function chunkText(text: string, size: number, overlap: number): string[] {
  if (!text) return [];
  if (size <= 0) size = 200;
  if (overlap < 0) overlap = 0;
  if (overlap >= size) overlap = Math.floor(size / 2);

  const chunks: string[] = [];
  let index = 0;
  while (index < text.length) {
    const end = Math.min(index + size, text.length);
    chunks.push(text.substring(index, end).trim());
    if (end === text.length) break;
    index += size - overlap;
  }
  return chunks;
}

/**
 * Basic word-overlap & exact-match TF-IDF similarity simulation
 */
export function computeSimilarity(queryText: string, chunkText: string): number {
  const queryLower = queryText.toLowerCase().trim();
  const chunkLower = chunkText.toLowerCase().trim();

  if (!queryLower || !chunkLower) return 0;

  // Split into words (characters/words longer than 1 character)
  const queryWords = queryLower.split(/[\s,.\-?!\(\)]+/).filter(w => w.length > 1);
  if (queryWords.length === 0) {
    return chunkLower.includes(queryLower) ? 0.35 : 0;
  }

  let matchedWords = 0;
  queryWords.forEach(word => {
    if (chunkLower.includes(word)) {
      matchedWords++;
    }
  });

  const wordOverlapScore = matchedWords / queryWords.length;
  const substringBoost = chunkLower.includes(queryLower) ? 0.45 : 0;

  // Return normalized score between 0.0 and 1.0
  return Math.min(1.0, wordOverlapScore * 0.7 + substringBoost);
}

/**
 * Retrieve all RAG documents from Firestore
 */
export async function getRagDocumentsFromDB(): Promise<RagDocument[]> {
  try {
    const q = query(collection(db, "rag_documents"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const docsList: RagDocument[] = [];
    querySnapshot.forEach((docSnap) => {
      docsList.push({ id: docSnap.id, ...docSnap.data() } as RagDocument);
    });
    return docsList;
  } catch (error) {
    console.error("Error loading RAG documents from Firestore:", error);
    throw error;
  }
}

/**
 * Save / Update a RAG Document in Firestore
 */
export async function saveRagDocumentToDB(docData: RagDocument): Promise<void> {
  try {
    await setDoc(doc(db, "rag_documents", docData.id), docData);
  } catch (error) {
    console.error("Error saving RAG document to Firestore:", error);
    throw error;
  }
}

/**
 * Update active status of a RAG Document in Firestore
 */
export async function updateRagDocumentStatusInDB(id: string, active: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, "rag_documents", id), { active });
  } catch (error) {
    console.error("Error updating RAG document active state in Firestore:", error);
    throw error;
  }
}

/**
 * Delete a RAG Document from Firestore
 */
export async function deleteRagDocumentFromDB(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "rag_documents", id));
  } catch (error) {
    console.error("Error deleting RAG document from Firestore:", error);
    throw error;
  }
}

/**
 * Seeding default World Building RAG Documents for Isol Land
 */
export async function seedSampleRagDocumentsInDB(chunkSize: number, chunkOverlap: number): Promise<RagDocument[]> {
  const defaultSamples = [
    {
      title: "이솔 건국 선언서 및 헌정 가치",
      category: "역사/건국",
      content: `이솔나라는 가상의 유기농 자치 생태 영토로, 2011년 녹색 연합과 생태주의 혁명가 이솔 장군에 의해 독립 주권 공표되었습니다. 
헌법 제1조: "이솔공화국은 민주생태 공화정이며, 모든 주권은 자연과 시민으로부터 나온다." 
이솔의 국기는 푸른 새싹과 해를 상징하는 원형 녹흑색 디자인이며, 기후 위기 극복 및 완전 평화 공존을 국가 건립 기본 이념으로 삼고 대외 공포합니다.`,
      active: true,
    },
    {
      title: "가상 소울센터와 국가 거버넌스",
      category: "정치/거버넌스",
      content: `이솔나라의 행정 중심인 소울센터는 시민 자치 분과와 민생위원회가 주관하여 정기 시민 총회를 소환 및 의결합니다. 
모든 중요 국가 시책은 블록체인 기반의 디지털 분산 투표를 통해 검인받아야 주권 효력이 발생합니다. 
소울센터에 정식 등록된 시민기자는 모든 관료와 기구의 행정 투명성을 가감 없이 폭로하고 시민 권익을 청구할 면책 특권을 보장받습니다.`,
      active: true,
    },
    {
      title: "이솔포스트 정론 가이드 및 윤리 강령",
      category: "미디어/보도",
      content: `이솔포스트 보도의 제1원칙은 "생명 존중 및 기후 중립"입니다. 
모든 기사는 반드시 5W1H 원칙(누가, 언제, 어디서, 무엇을, 어떻게, 왜)에 의거하여 명명백백하게 검증된 사실만을 정론 직필해야 합니다. 
출처 불명의 자극적인 루머나 가짜 뉴스는 실시간 팩트체크 AI 위원회 및 팩트스캔 정밀 인증망의 검토를 거쳐 주황색 '주의' 또는 빨간색 '가짜' 레이블을 배분받고 영구 박멸 조치됩니다.`,
      active: true,
    },
    {
      title: "이솔나라 화폐 및 생태 자생 경제권",
      category: "경제/산업",
      content: `이솔나라의 전용 통화는 '솔(SOL)'로 불리며, 탄소 절감 행동(자전거 출퇴근, 재활용 철저, 비건 식단 실천)을 입증할 때 국가 에코 보조금 명세 형식으로 안전하게 적립됩니다. 
석유화학 제품, 인공 합성 농약, 대량 공장식 육류 도축 제품 등 생태를 훼손하는 유해 사업은 전액 관세 조율 및 국경 내 유통/제조가 전면 차단 동결됩니다.`,
      active: true,
    },
    {
      title: "이솔 에코 안보 조약 및 국방 방어선",
      category: "사회/환경",
      content: `이솔나라는 무력 전차, 전투기, 살상용 핵무기 등 군사적 무력을 일체 불허 및 영토 침입 금지 선언을 공표했습니다. 
대신 친환경 특수 전자 국방장벽 '에코 배리어'와 '이지스 AI 탐지 전파망'을 이용해 무단 기후 오염 방류, 인공 전파 교란 공격 등을 철저히 검출하고 주권 수호를 실현합니다. 
평화 유지와 공정 언론이 이솔의 핵심 국가 안보 전략 수단으로 공식 법제화되어 있습니다.`,
      active: true,
    }
  ];

  const seededDocs: RagDocument[] = [];
  for (const sample of defaultSamples) {
    const id = "rag-sample-" + Math.random().toString(36).substring(2, 9);
    const docData: RagDocument = {
      id,
      title: sample.title,
      category: sample.category,
      content: sample.content,
      active: sample.active,
      createdAt: new Date().toISOString(),
      charCount: sample.content.length,
      chunkCount: chunkText(sample.content, chunkSize, chunkOverlap).length
    };
    
    try {
      await setDoc(doc(db, "rag_documents", id), docData);
    } catch (e) {
      console.warn("Firestore save error in seeding, sample saved to list anyway:", e);
    }
    seededDocs.push(docData);
  }
  return seededDocs;
}

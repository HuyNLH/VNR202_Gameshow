/* =====================================================
   questionBank.ts — Ngân hàng câu hỏi Lịch sử Đảng
   
   12 câu hỏi đa dạng hình thức, chia theo độ khó:
   - 4 câu Dễ (+5)   : C1-C4
   - 4 câu Vừa (+10) : C5-C8
   - 3 câu Khó (+15) : C9-C11
   - 1 câu Siêu khó (+20) : C12
   ===================================================== */

import type { Question } from '../types';

export const questionBank: Question[] = [
  // ════════════════════════════════════════════════════
  // 4 câu DỄ (+5/câu)
  // ════════════════════════════════════════════════════
  {
    id: 'C1',
    difficulty: 'easy',
    format: 'mcq',
    content: 'Đảng Cộng sản Việt Nam được thành lập vào năm nào?',
    options: [
      { label: 'A', text: '1925' },
      { label: 'B', text: '1929' },
      { label: 'C', text: '1930' },
      { label: 'D', text: '1931' },
    ],
    answer: 'C',
  },
  {
    id: 'C2',
    difficulty: 'easy',
    format: 'mcq',
    content: 'Ai là người chủ trì Hội nghị hợp nhất các tổ chức cộng sản đầu năm 1930?',
    options: [
      { label: 'A', text: 'Trần Phú' },
      { label: 'B', text: 'Nguyễn Ái Quốc' },
      { label: 'C', text: 'Lê Hồng Phong' },
      { label: 'D', text: 'Phan Bội Châu' },
    ],
    answer: 'B',
  },
  {
    id: 'C3',
    difficulty: 'easy',
    format: 'fill-blank',
    content: 'Hoàn thành câu: Hội nghị hợp nhất họp tại ______ (địa điểm) – ______ (lãnh thổ), thời gian ______ đến ______ năm 1930.',
    answer: 'Cửu Long – Hồng Kông; 6/1 đến 7/2',
    explanation: 'Hội nghị họp tại Cửu Long (Kowloon), thuộc Hồng Kông, từ ngày 6/1 đến 7/2/1930.',
  },
  {
    id: 'C4',
    difficulty: 'easy',
    format: 'mcq',
    content: 'Cương lĩnh chính trị đầu tiên thể hiện chủ yếu qua cặp văn kiện nào?',
    options: [
      { label: 'A', text: 'Luận cương chính trị & Điều lệ Đảng' },
      { label: 'B', text: 'Chánh cương vắn tắt & Sách lược vắn tắt' },
      { label: 'C', text: 'Tuyên ngôn độc lập & Chỉ thị Nhật–Pháp' },
      { label: 'D', text: 'Đường Kách mệnh & Bản án chế độ thực dân' },
    ],
    answer: 'B',
  },

  // ════════════════════════════════════════════════════
  // 4 câu VỪA (+10/câu)
  // ════════════════════════════════════════════════════
  {
    id: 'C5',
    difficulty: 'medium',
    format: 'short-answer',
    content: 'Nêu 3 ý nghĩa lịch sử của việc thành lập Đảng Cộng sản Việt Nam (gạch đầu dòng).',
    answer: '3 ý chính',
    gradingHints: [
      'Chấm dứt khủng hoảng đường lối / tổ chức lãnh đạo.',
      'Mở bước ngoặt lịch sử cho cách mạng Việt Nam.',
      'Gắn cách mạng Việt Nam với phong trào cách mạng thế giới / khẳng định vai trò lãnh đạo của giai cấp công nhân.',
    ],
  },
  {
    id: 'C6',
    difficulty: 'medium',
    format: 'mcq',
    content: 'Đỉnh cao của phong trào cách mạng 1930–1931 gắn với sự kiện nào?',
    options: [
      { label: 'A', text: 'Mặt trận Dân chủ Đông Dương ra đời' },
      { label: 'B', text: 'Xô viết Nghệ Tĩnh' },
      { label: 'C', text: 'Đại hội I của Đảng (1935)' },
      { label: 'D', text: 'Đông Dương đại hội' },
    ],
    answer: 'B',
  },
  {
    id: 'C7',
    difficulty: 'medium',
    format: 'true-false',
    content: 'Phong trào dân chủ 1936–1939 đặt mục tiêu trực tiếp là "giành độc lập hoàn toàn ngay lập tức".',
    answer: 'Sai',
    explanation: 'Mục tiêu trước mắt là tự do – dân chủ – cơm áo – hòa bình, chống phản động thuộc địa và tay sai.',
  },
  {
    id: 'C8',
    difficulty: 'medium',
    format: 'multi-select',
    content: 'Đâu là các ý đúng về Cương lĩnh chính trị đầu tiên (1930)?',
    options: [
      { label: 'A', text: 'Mục tiêu chiến lược: tư sản dân quyền + thổ địa cách mạng → xã hội cộng sản' },
      { label: 'B', text: 'Nhiệm vụ trước mắt: đánh đổ đế quốc Pháp và phong kiến, giành độc lập' },
      { label: 'C', text: 'Lực lượng nòng cốt: công–nông' },
      { label: 'D', text: 'Chủ trương đấu tranh chỉ theo con đường nghị trường hợp pháp' },
      { label: 'E', text: 'Có nêu định hướng xã hội–kinh tế như bình quyền, phổ thông giáo dục…' },
    ],
    answer: 'A, B, C, E',
    explanation: 'Đáp án D sai vì Cương lĩnh không chủ trương chỉ dùng con đường nghị trường hợp pháp.',
  },

  // ════════════════════════════════════════════════════
  // 3 câu KHÓ (+15/câu)
  // ════════════════════════════════════════════════════
  {
    id: 'C9',
    difficulty: 'hard',
    format: 'compare',
    content: 'So sánh phong trào 1930–1931 và 1936–1939 theo 3 tiêu chí:\n1) Mục tiêu trước mắt\n2) Hình thức đấu tranh chủ yếu\n3) Kết quả / tác động nổi bật',
    answer: 'So sánh 3 tiêu chí (mỗi tiêu chí 5đ)',
    gradingHints: [
      '1930–31: Mục tiêu đấu tranh quyết liệt chống đế quốc & phong kiến, đỉnh cao Xô viết Nghệ Tĩnh.',
      '1930–31: Hình thức bí mật, vũ trang, bạo động. Kết quả: bị đàn áp nặng nhưng khẳng định vai trò Đảng, rèn lực lượng.',
      '1936–39: Mục tiêu dân chủ – dân sinh – hòa bình.',
      '1936–39: Hình thức công khai / nửa công khai / hợp pháp. Kết quả: tập hợp lực lượng quần chúng rộng, tích lũy kinh nghiệm mặt trận.',
    ],
  },
  {
    id: 'C10',
    difficulty: 'hard',
    format: 'essay',
    content: 'Vì sao Đảng điều chỉnh chủ trương / sách lược qua các giai đoạn 1930–1931, 1932–1935, 1936–1939?',
    answer: 'Tự luận ngắn (5–7 dòng)',
    gradingHints: [
      'Bối cảnh quốc tế thay đổi (khủng hoảng, nguy cơ chiến tranh, chống phát xít…).',
      'Tương quan lực lượng & mức đàn áp của thực dân thay đổi.',
      'Yêu cầu khôi phục tổ chức sau khủng bố trắng.',
      'Mục tiêu trước mắt khác nhau để mở rộng mặt trận, tập hợp lực lượng.',
    ],
  },
  {
    id: 'C11',
    difficulty: 'hard',
    format: 'ordering',
    content: 'Sắp xếp đúng trình tự thời gian (từ sớm → muộn):',
    options: [
      { label: '1', text: 'Đại hội I của Đảng (Ma Cao)' },
      { label: '2', text: 'Hội nghị hợp nhất thành lập Đảng' },
      { label: '3', text: 'Lập Mặt trận Dân chủ Đông Dương' },
      { label: '4', text: 'Công bố Chương trình hành động khôi phục phong trào' },
      { label: '5', text: 'Hoàn tất thống nhất khi Đông Dương CS Liên đoàn gia nhập' },
    ],
    answer: '2 → 5 → 4 → 1 → 3',
    correctOrder: ['2', '5', '4', '1', '3'],
  },

  // ════════════════════════════════════════════════════
  // 1 câu SIÊU KHÓ (+20)
  // ════════════════════════════════════════════════════
  {
    id: 'C12',
    difficulty: 'expert',
    format: 'mcq',
    content: 'Nhận định nào đúng nhất về mối quan hệ giữa Cương lĩnh 2/1930 và chủ trương đấu tranh thời kỳ 1936–1939?',
    options: [
      { label: 'A', text: 'Cương lĩnh đặt độc lập làm trung tâm; giai đoạn 1936–1939 chỉ điều chỉnh mục tiêu trước mắt (dân chủ–dân sinh–hòa bình) và hình thức đấu tranh, không đổi mục tiêu chiến lược.' },
      { label: 'B', text: 'Cương lĩnh ưu tiên ruộng đất hơn độc lập; giai đoạn 1936–1939 chuyển sang độc lập ngay lập tức và chỉ dùng bí mật–vũ trang, nên thể hiện sự thay đổi hoàn toàn về đường lối.' },
      { label: 'C', text: 'Cương lĩnh xác định công–nông là nòng cốt; giai đoạn 1936–1939 thay bằng tư sản và địa chủ làm lực lượng chính, nhằm hợp pháp hóa đấu tranh nên mục tiêu độc lập bị tạm gác vô thời hạn.' },
      { label: 'D', text: 'Cương lĩnh chủ trương đánh đổ đế quốc và phong kiến ngay; giai đoạn 1936–1939 chuyển hẳn sang đấu tranh nghị trường hợp pháp là duy nhất, vì vậy chứng tỏ Cương lĩnh ban đầu không còn phù hợp thực tiễn.' },
    ],
    answer: 'A',
    explanation: '1936–1939 là điều chỉnh sách lược / mục tiêu trước mắt và phương thức để mở rộng lực lượng, không phải thay mục tiêu chiến lược đã nêu trong Cương lĩnh.',
  },
];

/**
 * Lookup a question by its ID.
 * Returns undefined if not found (app will use manual grading mode).
 */
export function getQuestionById(questionId: string): Question | undefined {
  return questionBank.find((q) => q.id === questionId);
}

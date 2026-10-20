import { existsSync, readFileSync, statSync } from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const source = readFileSync(path.join(root, 'js', 'data.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);
const app = sandbox.window.MindxGift;

const expectedNames = ['Lan Anh', 'Tuyết Như', 'Trúc Ly', 'Vân Anh', 'Ánh', 'Anh Thư', 'Phương Mai', 'Thu Hương', 'Kim Dung', 'Ngọc Phát', 'Lan Thanh', 'Mỹ Duyên', 'Thanh Nhàn'];
const expectedSlugs = ['lan-anh', 'tuyet-nhu', 'truc-ly', 'van-anh', 'anh', 'anh-thu', 'phuong-mai', 'thu-huong', 'kim-dung', 'ngoc-phat', 'lan-thanh', 'my-duyen', 'thanh-nhan'];

let failures = 0;
function check(label, condition) {
  console.log(`${condition ? 'OK  ' : 'FAIL'} ${label}`);
  if (!condition) failures += 1;
}

const recipients = Array.from(app.recipients);
const unique = (key) => new Set(recipients.map((recipient) => recipient[key])).size === recipients.length;

check('exactly 13 recipients', recipients.length === 13);
check('names exact and ordered', JSON.stringify(recipients.map((r) => r.name)) === JSON.stringify(expectedNames));
check('slugs exact and ordered', JSON.stringify(recipients.map((r) => r.slug)) === JSON.stringify(expectedSlugs));
['slug', 'flower', 'flowerType', 'tagline', 'wish', 'flowerMeaning', 'photo'].forEach((key) => check(`unique ${key}`, unique(key)));
check('unique wish openings (first 3 words)', new Set(recipients.map((r) => r.wish.split(/\s+/).slice(0, 3).join(' '))).size === 13);
const SENDER_PATTERN = /chúng mình|chúng tôi|cả nhà|gia đình|MindX gửi|gửi tặng|Từ MindX|MindX (?:chúc|muốn|trân trọng|xin)|Với tất cả/i;
recipients.forEach((recipient) => {
  const text = [recipient.wish, recipient.tagline, recipient.flowerMeaning].join(' ');
  check(`${recipient.slug}: anonymous sender (no MindX/collective sender wording)`, !SENDER_PATTERN.test(text));
});

const flowersSource = readFileSync(path.join(root, 'js', 'flowers.js'), 'utf8');

recipients.forEach((recipient) => {
  const photoPath = path.join(root, recipient.photo || '');
  check(`${recipient.slug}: photo is img/${recipient.slug}.jpg and exists`, recipient.photo === `img/${recipient.slug}.jpg` && existsSync(photoPath) && statSync(photoPath).size > 0);
  check(`${recipient.slug}: flowerMeaning is a NFC sentence`, typeof recipient.flowerMeaning === 'string' && recipient.flowerMeaning.length > 40 && recipient.flowerMeaning.endsWith('.') && recipient.flowerMeaning === recipient.flowerMeaning.normalize('NFC'));
  check(`${recipient.slug}: SVG builder exists for ${recipient.flowerType}`, flowersSource.includes(`    ${recipient.flowerType}(group, palette`));
  const sentences = recipient.wish.split(/[.!?…]+(?:\s|$)/).map((part) => part.trim()).filter(Boolean);
  check(`${recipient.slug}: wish has 3–5 sentences (${sentences.length})`, sentences.length >= 3 && sentences.length <= 5);
  const colors = Object.values(recipient.palette);
  check(`${recipient.slug}: palette has 4 hex colors`, colors.length === 4 && colors.every((color) => /^#[0-9A-F]{6}$/i.test(color)));
  check(`${recipient.slug}: wish is NFC normalized`, recipient.wish === recipient.wish.normalize('NFC') && recipient.name === recipient.name.normalize('NFC'));
});

check("findRecipient('anh') is Ánh", app.findRecipient('anh')?.name === 'Ánh');
check("findRecipient(' ANH-THU ') is Anh Thư", app.findRecipient(' ANH-THU ')?.name === 'Anh Thư');
['khong-ton-tai', '<img src=x>', null, '', undefined, 42, '__proto__', 'constructor'].forEach((value) => {
  check(`findRecipient(${JSON.stringify(value)}) is null`, app.findRecipient(value) === null);
});

if (failures) {
  console.log(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log('\nAll data checks passed');

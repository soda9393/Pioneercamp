
const loginForm = document.getElementById('loginForm');
const idInput = document.getElementById('idInput');
const pwInput = document.getElementById('pwInput');
const roleInput = document.getElementById('roleInput');
const loginStatus = document.getElementById('loginStatus');

const readUsers = async () => {
  const response = await fetch('user.csv', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('user.csv 로드 실패');
  }
  const text = await response.text();
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return [];

  const header = lines[0];
  let delimiter = ',';
  if (header.includes('\t')) delimiter = '\t';
  if (!header.includes(',') && header.includes('\t')) delimiter = '\t';

  return lines.slice(1).map((line) => {
    const [id, pw] = line.split(delimiter).map((v) => v.trim());
    return { id, pw };
  }).filter((row) => row.id && row.pw);
};

const setStatus = (message, isError = false) => {
  if (!loginStatus) return;
  loginStatus.textContent = message;
  loginStatus.style.color = isError ? '#e76f51' : '#2f4f4f';
};

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = idInput.value.trim();
    const pw = pwInput.value.trim();
    const role = roleInput.value;

    if (!role) {
      setStatus('구분을 선택해주세요.', true);
      return;
    }
    if (!id || !pw) {
      setStatus('아이디와 비밀번호를 입력해주세요.', true);
      return;
    }

    try {
      const users = await readUsers();
      const matched = users.find((user) => user.id === id && user.pw === pw);
      if (!matched) {
        setStatus('아이디 또는 비밀번호가 올바르지 않습니다.', true);
        return;
      }

      localStorage.setItem('campusUser', id);
      localStorage.setItem('campusRole', role);
      setStatus('로그인 성공! 메인으로 이동합니다.');
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 800);
    } catch (error) {
      setStatus('user.csv를 불러오지 못했습니다.', true);
    }
  });
}

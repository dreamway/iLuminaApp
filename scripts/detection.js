// 检测功能相关的JavaScript代码

// 问卷调查相关变量
let currentQuestion = 1;
const totalQuestions = 5;
let questionAnswers = [];

// 显示指定的问题
function showQuestion(questionNumber) {
    // 隐藏所有问题
    document.querySelectorAll('.question').forEach(q => {
        q.style.display = 'none';
    });
    
    // 显示当前问题
    document.getElementById(`question-${questionNumber}`).style.display = 'block';

    // 如果是第一题，禁用"上一题"按钮
    const prevButton = document.querySelector('.flow-actions .button.secondary');
    if (prevButton) {
        prevButton.disabled = questionNumber === 1;
    }
}

// 选择选项
function selectOption(element) {
    // 移除同级元素的选中状态
    const options = element.parentElement.querySelectorAll('.option-item');
    options.forEach(option => {
        option.classList.remove('selected');
    });

    // 添加选中状态
    element.classList.add('selected');

    // 保存答案
    questionAnswers[currentQuestion - 1] = element.querySelector('.option-label').textContent;

    // 延迟一小段时间后自动跳转到下一题
    setTimeout(() => {
        if (currentQuestion < totalQuestions) {
            currentQuestion++;
            showQuestion(currentQuestion);
        } else {
            // 问卷完成，进入下一步
            console.log('问卷完成，进入下一步');
            // 这里可以添加问卷完成后的逻辑
        }
    }, 500); // 500ms 延迟，让用户能看到选中效果
}

// 返回上一题
function previousQuestion() {
    if (currentQuestion > 1) {
        currentQuestion--;
        showQuestion(currentQuestion);

        // 恢复之前的选择（如果有）
        const previousAnswer = questionAnswers[currentQuestion - 1];
        if (previousAnswer) {
            const options = document.querySelectorAll(`#question-${currentQuestion} .option-item`);
            options.forEach(option => {
                if (option.querySelector('.option-label').textContent === previousAnswer) {
                    option.classList.add('selected');
                }
            });
        }
    }
}

// 拍照相关
function startCamera() {
    console.log('启动相机');
    // 这里可以添加启动相机的逻辑
}

function captureImage() {
    console.log('拍照');
    // 这里可以添加拍照的逻辑
}

function processDetectionResults() {
    console.log('处理检测结果');
    // 这里可以添加处理检测结果的逻辑
}

// 初始化检测页面
function initDetectionPage() {
    console.log('初始化检测页面');
    
    // 设置事件监听
    document.querySelectorAll('.option-item').forEach(item => {
        item.addEventListener('click', function() {
            selectOption(this);
        });
    });
    
    // 显示第一个问题
    showQuestion(1);
}

// 当页面加载完成时
document.addEventListener('DOMContentLoaded', function() {
    // 初始化检测页面
    initDetectionPage();
}); 
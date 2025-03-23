// 报告功能相关的JavaScript代码

// 显示报告详情
function displayReportDetail(reportId) {
    // 隐藏列表
    document.querySelector('.report-list').style.display = 'none';
    
    // 显示详情
    const detailElement = document.getElementById(`${reportId}-detail`);
    if (detailElement) {
        detailElement.style.display = 'block';
    }
    
    // 初始化雷达图
    initRadarChart();
}

// 隐藏报告详情，返回列表
function hideReportDetail() {
    // 隐藏所有详情
    document.querySelectorAll('.report-detail').forEach(detail => {
        detail.style.display = 'none';
    });
    
    // 显示列表
    document.querySelector('.report-list').style.display = 'block';
}

// 分享报告
function shareReport(reportId) {
    console.log(`分享报告: ${reportId}`);
    // 这里可以添加分享报告的逻辑
    alert('报告分享功能即将上线');
}

// 查看推荐方案
function viewRecommendation(reportId) {
    console.log(`查看推荐方案: ${reportId}`);
    // 这里可以添加查看推荐方案的逻辑
}

// 使用ECharts绘制雷达图
function initRadarChart() {
    // 模拟数据
    const chartDom = document.getElementById('radar-chart');
    if (chartDom) {
        const myChart = echarts.init(chartDom);
        const option = {
            radar: {
                indicator: [
                    { name: '视力健康', max: 100 },
                    { name: '眼表健康', max: 100 },
                    { name: '眼肌健康', max: 100 },
                    { name: '眼压健康', max: 100 },
                    { name: '眼周健康', max: 100 }
                ]
            },
            series: [{
                type: 'radar',
                data: [
                    {
                        value: [80, 70, 75, 90, 75],
                        name: '健康评分',
                        areaStyle: {
                            color: 'rgba(33, 150, 243, 0.3)'
                        },
                        lineStyle: {
                            color: '#2196F3'
                        }
                    }
                ]
            }]
        };
        myChart.setOption(option);
    }
}

// 导出报告
function exportReport(reportId) {
    console.log(`导出报告: ${reportId}`);
    // 这里可以添加导出报告的逻辑
    alert('报告导出功能即将上线');
}

// 初始化报告页面
function initReportPage() {
    console.log('初始化报告页面');
    
    // 设置事件监听
    document.querySelectorAll('.report-item').forEach(item => {
        item.addEventListener('click', function() {
            const reportId = this.getAttribute('data-report-id');
            if (reportId) {
                displayReportDetail(reportId);
            }
        });
    });
    
    // 设置返回按钮监听
    const backButtons = document.querySelectorAll('.report-back-button');
    if (backButtons) {
        backButtons.forEach(button => {
            button.addEventListener('click', hideReportDetail);
        });
    }
}

// 当页面加载完成时
document.addEventListener('DOMContentLoaded', function() {
    // 初始化报告页面
    initReportPage();
}); 
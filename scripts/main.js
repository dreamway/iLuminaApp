// 定义页面路由映射
const routes = {
    'home': 'pages/home.html',
    'detection': 'pages/detection.html',
    'report': 'pages/report.html',
    'profile': 'pages/profile.html',
    'campaign-detail': 'pages/campaign-detail.html',
    'campaigns': 'pages/campaigns.html'
};

// 检查组件是否已加载
let componentsLoaded = false;

// 页面加载完成时执行
window.addEventListener('load', function() {
    // 如果组件尚未加载，则加载组件
    if (!componentsLoaded) {
        loadComponents();
    }
    
    // 确保底部导航功能正常
    setupNavigation();
    
    // 检查当前页面是否已加载
    if (!document.querySelector('.page')) {
        // 加载默认页面
        navigateTo('home');
    }
});

// 加载公共组件
function loadComponents() {
    console.log('加载公共组件');
    
    // 检查头部是否为空
    if (!document.getElementById('header').innerHTML) {
        fetch('components/header.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`无法加载头部组件: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                document.getElementById('header').innerHTML = html;
            })
            .catch(error => {
                console.error('加载头部组件失败:', error);
            });
    }
    
    // 检查底部是否为空
    if (!document.getElementById('footer').innerHTML) {
        fetch('components/footer.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`无法加载底部组件: ${response.status}`);
                }
                return response.text();
            })
        .then(html => {
                document.getElementById('footer').innerHTML = html;
                // 组件加载后设置导航事件
                setupNavigation();
            })
            .catch(error => {
                console.error('加载底部组件失败:', error);
            });
    }
    
    componentsLoaded = true;
}

// 设置导航事件
function setupNavigation() {
    console.log('设置导航事件');
    const navItems = document.querySelectorAll('.nav-item');
    if (navItems && navItems.length > 0) {
        navItems.forEach(item => {
            const pageId = item.getAttribute('data-page');
            if (pageId) {
                item.onclick = function() {
                    navigateTo(pageId);
                };
            }
        });
}
}

// 页面路由
function navigateTo(pageId) {
    console.log(`导航到页面: ${pageId}`);
    
    // 获取内容容器
    const contentElement = document.getElementById('content');
    if (!contentElement) {
        console.error('找不到内容容器元素');
        return;
    }
    
    // 显示加载指示器
    contentElement.innerHTML = '<div class="loading-container"><span class="material-icons loading-icon">hourglass_top</span><p>加载中...</p></div>';

    // 处理特殊页面
    if (pageId === 'campaign-detail') {
        const campaignId = window.currentCampaignId;
        if (campaignId) {
            showCampaignDetail(campaignId);
            return;
        } else {
            console.error('未找到活动ID，将跳转到首页');
            pageId = 'home';
        }
    } else if (pageId.startsWith('treatment-detail:')) {
        const treatmentId = pageId.split(':')[1];
        showTreatmentDetail(treatmentId);
        return;
    }

    // 获取对应页面的HTML路径
    const route = routes[pageId];
    if (!route) {
        contentElement.innerHTML = `<div class="error-message">页面不存在: ${pageId}</div>`;
        return;
    }
    
    // 设置超时，防止无限加载
    const timeout = setTimeout(() => {
        if (contentElement.querySelector('.loading-container')) {
            contentElement.innerHTML = `<div class="error-message">加载超时，请<a href="javascript:location.reload()">刷新页面</a>重试</div>`;
        }
    }, 10000); // 10秒超时
    
    // 加载页面
    fetch(route)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            // 清除超时
            clearTimeout(timeout);
            
            // 创建一个临时容器来解析HTML
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = html;
            
            // 提取所有脚本
            const scripts = tempContainer.querySelectorAll('script');
            const scriptPromises = [];
            
            // 移除原HTML中的脚本标签（但保留其位置信息）
            scripts.forEach(script => {
                const placeholder = document.createElement('script-placeholder');
                placeholder.dataset.src = script.src || '';
                placeholder.dataset.content = script.textContent;
                script.parentNode.replaceChild(placeholder, script);
            });
            
            // 更新页面内容（不包含脚本）
            contentElement.innerHTML = tempContainer.innerHTML;
            
            // 更新导航栏选中状态
            updateFooterActiveState(pageId);
            
            // 按顺序执行脚本
            const executeScripts = async () => {
                console.log(`开始执行页面脚本，共 ${scripts.length} 个`);
                
                for (const oldScript of scripts) {
                    await new Promise((resolve, reject) => {
                        const newScript = document.createElement('script');
                        
                        // 复制脚本属性
                        Array.from(oldScript.attributes).forEach(attr => {
                            newScript.setAttribute(attr.name, attr.value);
                        });
                        
                        // 如果是外部脚本
                        if (oldScript.src) {
                            newScript.onload = resolve;
                            newScript.onerror = reject;
                            newScript.src = oldScript.src;
                        } else {
                            // 内联脚本
                            newScript.textContent = oldScript.textContent;
                            resolve();
                        }
                        
                        // 将脚本添加到文档中
                        document.body.appendChild(newScript);
                    }).catch(error => {
                        console.error('执行脚本时出错:', error);
                    });
                }
            };
            
            // 执行脚本并初始化页面
            executeScripts().then(() => {
                console.log('所有页面脚本执行完成，开始初始化页面');
                
                // 给页面脚本一点时间完成全局函数的注册
                setTimeout(() => {
                    switch (pageId) {
                        case 'home':
                            if (typeof window.initHomePage === 'function') {
                                console.log('调用首页初始化函数');
                                try {
                                    window.initHomePage();
                                } catch (error) {
                                    console.error('初始化首页失败:', error);
                                    // 使用后备初始化
                                    initializeFallbackCarousel();
                                }
                            } else {
                                console.log('未找到initHomePage函数，使用后备初始化');
                                initializeFallbackCarousel();
                            }
                            break;
                        case 'detection':
                            if (typeof initDetectionPage === 'function') {
                                initDetectionPage();
                            }
                            break;
                        case 'report':
                            if (typeof initReportPage === 'function') {
                                initReportPage();
                            }
                            break;
                        case 'profile':
                            if (typeof initProfilePage === 'function') {
                                initProfilePage();
                            }
                            break;
                        case 'campaigns':
                            if (typeof loadAllCampaigns === 'function') {
                                loadAllCampaigns();
                            }
                            break;
                    }
                }, 100);
            }).catch(error => {
                console.error('初始化页面时出错:', error);
                // 使用基本初始化作为后备
                if (pageId === 'home') {
                    initializeFallbackCarousel();
                }
            });
        })
        .catch(error => {
            // 清除超时
            clearTimeout(timeout);
            
            console.error('加载页面失败:', error);
            contentElement.innerHTML = `
                <div style="text-align:center; padding:20px;">
                    <h2>页面加载失败</h2>
                    <p>${error.message}</p>
                    <button class="button" onclick="location.reload()">刷新页面</button>
                </div>`;
        });
}

// 更新底部导航选中状态
function updateFooterActiveState(pageId) {
    try {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const itemPageId = item.getAttribute('data-page');
            if (itemPageId === pageId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    } catch (error) {
        console.error('更新导航状态失败:', error);
        // 不阻断主流程
    }
}

// 返回上一页
function goBack() {
    window.history.back();
}

// 显示活动详情
function showCampaignDetail(campaignId) {
    console.log(`显示活动详情: ${campaignId}`);
    const contentElement = document.getElementById('content');
    
    if (!contentElement) {
        console.error('找不到内容容器元素');
        return;
    }
    
    contentElement.innerHTML = '<div class="loading-container"><span class="material-icons loading-icon">hourglass_top</span><p>加载中...</p></div>';
    
    // 加载活动详情页
    fetch('pages/campaign-detail.html')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            contentElement.innerHTML = html;
            
            // 获取活动数据
            fetch('data/store_campaigns.json')
                .then(response => response.json())
                .then(data => {
                    const campaign = data.activities.find(a => a.id == campaignId);
                    if (!campaign) {
                        throw new Error(`未找到ID为 ${campaignId} 的活动`);
                    }
                    
                    // 调用活动详情页的渲染函数
                    if (typeof renderCampaignDetail === 'function') {
                        setTimeout(() => {
                            try {
                                renderCampaignDetail(campaign);
                            } catch (error) {
                                console.error('渲染活动详情失败:', error);
                            }
                        }, 100);
                    } else {
                        console.error('未找到renderCampaignDetail函数');
                    }
                })
                .catch(error => {
                    console.error('获取活动数据失败:', error);
                    showErrorMessage(contentElement, error.message);
                });
        })
        .catch(error => {
            console.error('加载活动详情页失败:', error);
            showErrorMessage(contentElement, error.message);
        });
}

// 显示错误信息
function showErrorMessage(container, message) {
    if (container) {
        container.innerHTML = `
            <div style="text-align:center; padding:20px;">
                <h2>加载失败</h2>
                <p>${message}</p>
                <button class="button" onclick="navigateTo('home')">返回首页</button>
            </div>`;
    }
}

// 显示治疗项目详情
function showTreatmentDetail(treatmentId) {
    console.log(`显示治疗项目详情: ${treatmentId}`);
    const contentElement = document.getElementById('content');
    contentElement.innerHTML = '<div class="loading-container"><span class="material-icons loading-icon">hourglass_top</span><p>加载中...</p></div>';
    
    // 加载治疗项目详情页
    fetch('pages/treatment-detail.html')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            contentElement.innerHTML = html;
            
            // 检查页面元素是否存在
            const page = document.getElementById('treatment-detail-page');
            if (page) {
                page.style.display = 'block';
            } else {
                console.error('找不到treatment-detail-page元素');
            }
            
            // 将英文ID转换为对应的json数据ID
            let jsonTreatmentId = "";
            switch(treatmentId) {
                case "eye-fatigue":
                    jsonTreatmentId = "eye-fatigue-care";
                    break;
                case "dry-eye":
                    jsonTreatmentId = "eye-sensitive-care"; // 临时映射，应该创建干眼缓解项目
                    break;
                case "eye-aging":
                    jsonTreatmentId = "eye-aging-care";
                    break;
                case "eye-sensitive":
                    jsonTreatmentId = "eye-sensitive-care";
                    break;
                default:
                    jsonTreatmentId = treatmentId;
            }
            
            // 选中对应选项卡，确保元素已经存在并且函数安全
            setTimeout(() => {
                const tabs = document.querySelectorAll('.treatment-tab');
                if (tabs && tabs.length > 0) {
                    tabs.forEach(tab => {
                        if (tab.getAttribute('data-treatment') === jsonTreatmentId) {
                            tab.click();
                        }
                    });
                    
                    // 如果没有找到对应选项卡，加载第一个
                    if (!document.querySelector('.treatment-tab.active')) {
                        const firstTab = document.querySelector('.treatment-tab');
                        if (firstTab) {
                            firstTab.click();
                        }
                    }
                } else {
                    console.error('找不到treatment-tab元素');
                }
            }, 100);
        })
        .catch(error => {
            console.error('加载治疗项目详情页失败:', error);
            contentElement.innerHTML = `
                <div style="text-align:center; padding:20px;">
                    <h2>页面加载失败</h2>
                    <p>${error.message}</p>
                </div>`;
        });
}

// 显示案例详情
function showCaseDetail(caseId) {
    console.log(`显示案例详情: ${caseId}`);
    const contentElement = document.getElementById('content');
    contentElement.innerHTML = '<div class="loading-container"><span class="material-icons loading-icon">hourglass_top</span><p>加载中...</p></div>';
    
    // 加载案例详情页
    fetch('pages/case-detail.html')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            contentElement.innerHTML = html;
            const page = document.getElementById('case-detail-page');
            if (page) {
                page.style.display = 'block';
            }
            
            // 加载案例特定数据
            if (typeof loadCaseData === 'function') {
                loadCaseData(caseId);
            }
        })
        .catch(error => {
            console.error('加载案例详情页失败:', error);
            contentElement.innerHTML = `
                <div style="text-align:center; padding:20px;">
                    <h2>页面加载失败</h2>
                    <p>${error.message}</p>
                </div>`;
        });
}

// 添加一个备用的轮播图初始化函数
function initializeFallbackCarousel() {
    const carousel = document.querySelector('.carousel-container');
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.carousel-slide');
    if (!slides || slides.length === 0) return;
    
    let currentSlide = 0;
    
    // 显示第一张幻灯片
    slides.forEach((slide, index) => {
        slide.style.display = index === 0 ? 'block' : 'none';
    });
    
    // 如果有轮播指示器，设置第一个为活跃
    const indicators = document.querySelectorAll('.carousel-indicator');
    if (indicators && indicators.length > 0) {
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === 0);
            
            // 添加点击事件
            indicator.addEventListener('click', () => {
                showSlide(index);
            });
        });
    }
    
    // 如果有轮播控制按钮，添加事件
    const prevButton = document.querySelector('.carousel-prev');
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            showSlide(currentSlide - 1);
        });
    }
    
    const nextButton = document.querySelector('.carousel-next');
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            showSlide(currentSlide + 1);
        });
    }
    
    // 定义切换幻灯片的函数
    function showSlide(index) {
        // 边界检查
        if (index < 0) {
            index = slides.length - 1;
        } else if (index >= slides.length) {
            index = 0;
        }
        
        // 隐藏所有幻灯片
        slides.forEach(slide => {
            slide.style.display = 'none';
        });
        
        // 显示当前幻灯片
        slides[index].style.display = 'block';
        currentSlide = index;
        
        // 更新指示器
        if (indicators && indicators.length > 0) {
            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === index);
            });
        }
    }
    
    // 自动轮播
    setInterval(() => {
        showSlide(currentSlide + 1);
    }, 5000);
}

// 页面初始化函数
function initializeHomePage(container) {
    console.log('直接初始化首页');
    
    // 初始化轮播图
    const carouselContainer = container.querySelector('.carousel-container');
    if (carouselContainer) {
        initializeFallbackCarousel();
    }
    
    // 初始化按钮和其他元素
    // ...
}

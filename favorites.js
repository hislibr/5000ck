// 5000年历史仓库收藏插件 - 修复版
add_action('wp_footer', function() {
?>
<script type="text/javascript">
jQuery(document).ready(function($) {
const FAV_KEY = 'nlf_user_favorites';

function getFavorites() {
    let favs = localStorage.getItem(FAV_KEY);
    return favs ? JSON.parse(favs) : [];
}

function saveFavorites(favs) {
    localStorage.setItem(FAV_KEY, JSON.stringify(favs));
}

function toggleFavorite(postId) {
    let favs = getFavorites();
    const id = String(postId);
    const index = favs.indexOf(id);
    if (index > -1) {
        favs.splice(index, 1);
        return { status: 'removed', favs: favs };
    } else {
        favs.push(id);
        return { status: 'added', favs: favs };
    }
}

function renderFavoriteBtn() {
    let favs = getFavorites();
    $('.nlf-favorite-btn').each(function() {
        let btn = $(this);
        let postId = btn.attr('data-post-id');
        let goBtn = btn.parent().find('.nlf-go-favorites');
        
        if (favs.includes(postId)) {
            btn.addClass('active');
            btn.find('.nlf-text').text('已收藏');
            if (goBtn.length) goBtn.css('display', 'inline-flex');
        } else {
            btn.removeClass('active');
            btn.find('.nlf-text').text('收藏文章');
            if (goBtn.length) goBtn.css('display', 'none');
        }
    });
}

function renderFavoritesPage() {
    let container = $('#nlf-favorites-list');
    if (!container.length) return;
    let favs = getFavorites();
    
    if (favs.length === 0) {
        container.html('<p id="nlf-empty-fav">暂无收藏文章</p>');
        return;
    }

    container.html('<p>正在加载收藏文章...</p>');
    let validPosts = [];
    let loaded = 0;

    favs.forEach(function(postId) {
        $.getJSON("<?php echo esc_url(rest_url()); ?>wp/v2/posts/" + postId)
        .done(function(post) {
            validPosts.push(post);
            loaded++;
            if (loaded === favs.length) {
                validPosts.sort((a, b) => b.id - a.id);
                let html = '';
                validPosts.forEach(p => {
                    html += `<div class="nlf-favorite-item" data-post-id="${p.id}">
                        <h3>
                            <a href="${p.link}" target="_blank">${p.title.rendered}</a>
                            <span class="remove-fav" data-post-id="${p.id}">取消收藏</span>
                        </h3>
                    </div>`;
                });
                container.html(html);
            }
        })
        .fail(function() {
            loaded++;
            let newFavs = getFavorites().filter(id => id !== postId);
            saveFavorites(newFavs);
            if (loaded === favs.length) renderFavoritesPage();
        });
    });
}

// 🔥 修复点击事件（委托模式，动态按钮也能响应）
$(document).on('click', '.nlf-favorite-btn', function() {
    let btn = $(this);
    let postId = btn.attr('data-post-id');
    let res = toggleFavorite(postId);
    saveFavorites(res.favs);
    renderFavoriteBtn();
});

$(document).on('click', '.remove-fav', function() {
    let el = $(this);
    let postId = el.attr('data-post-id');
    let favs = getFavorites().filter(id => id !== String(postId));
    saveFavorites(favs);
    renderFavoritesPage();
    renderFavoriteBtn();
});

renderFavoriteBtn();
renderFavoritesPage();
});
</script>
<?php
}, 99);

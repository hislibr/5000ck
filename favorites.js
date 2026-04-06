jQuery(document).ready(function ($) {
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

    // ✅ 修复：强制添加 .active 类，确保 CSS 一定生效
    function renderFavoriteBtn() {
        let favs = getFavorites();
        $('.nlf-favorite-btn').each(function () {
            let $btn = $(this);
            let postId = String($btn.data('post-id'));
            let $goBtn = $btn.parent().find('.nlf-go-favorites');

            if (favs.includes(postId)) {
                // ✅ 强制激活
                $btn.addClass('active');
                $btn.find('.nlf-text').text('已收藏');
                $goBtn.show();
            } else {
                // ✅ 强制移除
                $btn.removeClass('active');
                $btn.find('.nlf-text').text('收藏文章');
                $goBtn.hide();
            }
        });
    }

    function renderFavoritesPage() {
        let favs = getFavorites();
        let $container = $('#nlf-favorites-list');

        if (favs.length === 0) {
            $container.html('<p id="nlf-empty-fav">暂无收藏文章</p>');
            return;
        }

        $container.html('<p>正在加载收藏文章...</p>');
        let validPosts = [];
        let loaded = 0;

        favs.forEach(postId => {
            $.getJSON(nlf_vars.rest_url + 'wp/v2/posts/' + postId, function (post) {
                validPosts.push(post);
                loaded++;
                if (loaded === favs.length) {
                    validPosts.sort((a, b) => b.id - a.id);
                    let html = '';
                    validPosts.forEach(post => {
                        html += `
                        <div class="nlf-favorite-item" data-post-id="${post.id}">
                            <h3>
                                <a href="${post.link}" target="_blank">${post.title.rendered}</a>
                                <span class="remove-fav" data-post-id="${post.id}">取消收藏</span>
                            </h3>
                        </div>`;
                    });
                    $container.html(html);
                }
            }).fail(() => {
                loaded++;
                let newFavs = getFavorites().filter(id => id !== postId);
                saveFavorites(newFavs);
                if (loaded === favs.length) renderFavoritesPage();
            });
        });
    }

    $(document).on('click', '.nlf-favorite-btn', function () {
        let res = toggleFavorite($(this).data('post-id'));
        saveFavorites(res.favs);
        renderFavoriteBtn();
    });

    $(document).on('click', '.remove-fav', function () {
        let postId = $(this).data('post-id');
        let favs = getFavorites().filter(id => id !== String(postId));
        saveFavorites(favs);
        renderFavoritesPage();
        renderFavoriteBtn();
    });

    // 初始化
    renderFavoriteBtn();
    if ($('#nlf-favorites-list').length) {
        renderFavoritesPage();
    }
});
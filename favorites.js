// 5000年历史仓库收藏插件
add_action('wp_footer', function() {
?>
<script type="text/javascript">
document.addEventListener("DOMContentLoaded", function() {
const FAV_KEY = 'nlf_user_favorites';

function getFavorites(){let favs=localStorage.getItem(FAV_KEY);return favs?JSON.parse(favs):[];}
function saveFavorites(favs){localStorage.setItem(FAV_KEY,JSON.stringify(favs));}

function toggleFavorite(postId){
let favs=getFavorites();const id=String(postId);
const index=favs.indexOf(id);
if(index>-1){favs.splice(index,1);return{status:'removed',favs:favs};}
else{favs.push(id);return{status:'added',favs:favs};}
}

function renderFavoriteBtn(){
let favs=getFavorites();
document.querySelectorAll('.nlf-favorite-btn').forEach(function(btn){
let postId = btn.getAttribute('data-post-id');
let goBtn = btn.parentElement.querySelector('.nlf-go-favorites');
if(favs.includes(postId)){
btn.classList.add('active');
let text = btn.querySelector('.nlf-text');
if(text) text.textContent = '已收藏';
if(goBtn) goBtn.style.display = 'inline-flex';
}else{
btn.classList.remove('active');
let text = btn.querySelector('.nlf-text');
if(text) text.textContent = '收藏文章';
if(goBtn) goBtn.style.display = 'none';
}
});
}

function renderFavoritesPage(){
let container = document.getElementById('nlf-favorites-list');
if(!container) return;
let favs = getFavorites();
if(favs.length === 0){
container.innerHTML = '<p id="nlf-empty-fav">暂无收藏文章</p>';
return;
}
container.innerHTML = '<p>正在加载收藏文章...</p>';
let validPosts = [];
let loaded = 0;
favs.forEach(function(postId){
fetch("<?php echo esc_url(rest_url()); ?>wp/v2/posts/"+postId)
.then(res=>{
if(!res.ok) throw new Error('post not found');
return res.json();
})
.then(post=>{
validPosts.push(post);loaded++;
if(loaded === favs.length){
validPosts.sort((a,b)=>b.id-a.id);
let html = '';
validPosts.forEach(p=>{
html+=`<div class="nlf-favorite-item" data-post-id="${p.id}"><h3><a href="${p.link}" target="_blank">${p.title.rendered}</a><span class="remove-fav" data-post-id="${p.id}">取消收藏</span></h3></div>`;
});
container.innerHTML = html;
}
})
.catch(()=>{
loaded++;
let newFavs = getFavorites().filter(id=>id!==postId);
saveFavorites(newFavs);
if(loaded === favs.length) renderFavoritesPage();
});
});
}

document.addEventListener('click',function(e){
if(e.target.closest('.nlf-favorite-btn')){
let btn = e.target.closest('.nlf-favorite-btn');
let postId = btn.getAttribute('data-post-id');
let res = toggleFavorite(postId);
saveFavorites(res.favs);
renderFavoriteBtn();
}
if(e.target.closest('.remove-fav')){
let el = e.target.closest('.remove-fav');
let postId = el.getAttribute('data-post-id');
let favs = getFavorites().filter(id=>id!==String(postId));
saveFavorites(favs);
renderFavoritesPage();
renderFavoriteBtn();
}
});

renderFavoriteBtn();
renderFavoritesPage();
});
</script>
<?php
}, 99);

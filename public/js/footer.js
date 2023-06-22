const createFooter = () => {
    let footer = document.querySelector('footer');

    footer.innerHTML=`
    
    <div class="footer-content">
        
        
    </div>
    <p class="footer-title">about company</p>
    <p class="info"> Lorem ipsum dolor sit amet consectetur adipisicing elit. At iure error alias cumque repudiandae dignissimos explicabo provident perferendis quaerat, reiciendis libero culpa consectetur ea odio quos accusantium sint. Aliquam, maiores.  
    </p>
    <p class="info">support emails - help@clothing.com,
        customersupport@clothing.com
    </p>
    <p class="info">telephone - 6980080604</p>
    <div class="footer-social-container">
        <div>
            <a href="#" class="social-link">terms & services</a>
            <a href="#" class="social-link">privacy page</a>
        </div>
        <div>
            <a href="#" class="social-link">instagram</a>
            <a href="#" class="social-link">facebook</a>
            <a href="#" class="social-link">twitter</a>
        </div>
    </div>
    <p class="footer-credit">All Rights and Lefts reserved.</p>

    
    `;
}

createFooter();
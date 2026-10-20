(function (app) {
  'use strict';

  const recipients = [
    {
      slug: 'lan-anh',
      photo: 'img/lan-anh.jpg',
      name: 'Lan Anh',
      flower: 'Hoa lan hồ điệp',
      flowerType: 'orchid',
      palette: { petal: '#D9A7E8', petalDeep: '#9C5BB8', center: '#F7E27A', glow: '#F3E1FA' },
      tagline: 'Thanh tao và kiêu hãnh như đóa lan',
      flowerMeaning: 'Hoa lan hồ điệp tượng trưng cho vẻ đẹp thanh cao, sang trọng và sự tinh tế, đúng như nét điềm tĩnh, tinh anh mà Lan Anh luôn mang theo.',
      wish: 'Giữa những ngày bận rộn, sự điềm tĩnh và tinh tế của Lan Anh luôn khiến mọi thứ quanh mình trở nên nhẹ nhàng hơn. Như đóa lan lặng lẽ tỏa hương, bạn chẳng cần ồn ào mà vẫn khiến người khác phải ngưỡng mộ. Nhân ngày 20/10, cả nhà MindX chúc bạn luôn giữ được nét thanh tao và tinh anh ấy, cùng thật nhiều niềm vui trên mỗi chặng đường. Cảm ơn bạn vì đã là một phần không thể thiếu của chúng mình.'
    },
    {
      slug: 'tuyet-nhu',
      photo: 'img/tuyet-nhu.jpg',
      name: 'Tuyết Như',
      flower: 'Hoa cúc họa mi',
      flowerType: 'daisy',
      palette: { petal: '#FFFFFF', petalDeep: '#DCE3EE', center: '#F5C842', glow: '#EEF3FB' },
      tagline: 'Trong trẻo như tuyết đầu mùa',
      flowerMeaning: 'Cúc họa mi trắng là biểu tượng của sự trong trẻo, ngây thơ và tình cảm chân thành; nở vào cuối thu, nhỏ bé mà kiên cường như sắc tuyết trong tên Tuyết Như.',
      wish: 'Gửi Tuyết Như, người mang đến cho MindX cảm giác trong trẻo như những bông tuyết đầu mùa. Cúc họa mi chỉ nở vào cuối thu, nhỏ bé mà kiên cường, và chúng mình thấy ở bạn đúng vẻ đẹp dịu dàng mà bền bỉ ấy. Chúc bạn một ngày 20/10 thật ấm áp, được yêu thương nhiều như cách bạn vẫn luôn quan tâm mọi người. Mong mỗi ngày của bạn đều bình yên và đầy ắp tiếng cười.'
    },
    {
      slug: 'truc-ly',
      photo: 'img/truc-ly.jpg',
      name: 'Trúc Ly',
      flower: 'Hoa ly',
      flowerType: 'lily',
      palette: { petal: '#FFD6E0', petalDeep: '#E86A8E', center: '#F2B544', glow: '#FFF0F4' },
      tagline: 'Thẳng ngay như trúc, dịu dàng như ly',
      flowerMeaning: 'Hoa ly tượng trưng cho sự cao quý, thuần khiết và lòng thủy chung, hòa cùng nét thẳng ngay, bền bỉ của cây trúc trong tên Trúc Ly.',
      wish: 'Trúc Ly ơi, cái tên của bạn thật đẹp: vừa có sự thẳng ngay, bền bỉ của cây trúc, vừa có nét kiêu sa, dịu dàng của hoa ly. Mỗi lần cùng nhau làm việc, chúng mình đều cảm nhận được sự chân thành và tận tâm ấy. Nhân Ngày Phụ nữ Việt Nam, MindX chúc bạn luôn vững vàng trước mọi thử thách mà vẫn giữ trọn sự mềm mại trong tâm hồn. Mong những điều tốt đẹp nhất sẽ luôn tìm đến bạn.'
    },
    {
      slug: 'van-anh',
      photo: 'img/van-anh.jpg',
      name: 'Vân Anh',
      flower: 'Hoa cẩm tú cầu',
      flowerType: 'hydrangea',
      palette: { petal: '#A9C8F0', petalDeep: '#6C8FD6', center: '#F1F5FF', glow: '#E3EDFB' },
      tagline: 'Nhẹ nhàng như mây, rạng ngời như nắng',
      flowerMeaning: 'Cẩm tú cầu mang ý nghĩa của sự chân thành, lòng biết ơn và gắn kết, muôn bông nhỏ cùng nở thành một chùm, nhẹ nhàng như áng mây trong tên Vân Anh.',
      wish: 'Như những áng mây nhẹ trôi trên bầu trời, Vân Anh mang đến cho mọi người cảm giác thư thái và dễ chịu. Cẩm tú cầu là hàng trăm bông hoa nhỏ hợp lại thành một chùm rực rỡ, giống như cách bạn góp phần gắn kết cả nhà MindX. Chúc bạn một ngày 20/10 ngập tràn hoa và lời thương. Mong bạn luôn tự do theo đuổi những điều mình yêu thích, nhẹ nhàng và rạng ngời như chính cái tên của mình.'
    },
    {
      slug: 'anh',
      photo: 'img/anh.jpg',
      name: 'Ánh',
      flower: 'Hoa hướng dương',
      flowerType: 'sunflower',
      palette: { petal: '#FFC93C', petalDeep: '#F29E1F', center: '#7A4A1E', glow: '#FFF1C9' },
      tagline: 'Rạng rỡ như ánh nắng ban mai',
      flowerMeaning: 'Hướng dương là biểu tượng của niềm tin, sự lạc quan và lòng trung thành, luôn hướng về phía mặt trời như chính ánh sáng trong tên Ánh.',
      wish: 'Ánh à, đúng như tên gọi, bạn là một nguồn sáng thật ấm áp của MindX. Hướng dương luôn quay về phía mặt trời, và ở bên bạn, chúng mình cũng thấy mình hướng về những điều tích cực hơn. Nhân ngày đặc biệt này, chúc bạn luôn khỏe mạnh, rạng rỡ và đón nhận thật nhiều niềm vui. Cảm ơn bạn vì đã thắp sáng những ngày làm việc của cả nhà.'
    },
    {
      slug: 'anh-thu',
      photo: 'img/anh-thu.jpg',
      name: 'Anh Thư',
      flower: 'Hoa anh đào',
      flowerType: 'sakura',
      palette: { petal: '#FFC6D9', petalDeep: '#F48FB1', center: '#FFE08A', glow: '#FFEAF2' },
      tagline: 'Dịu dàng như anh đào, bản lĩnh như anh thư',
      flowerMeaning: 'Hoa anh đào tượng trưng cho vẻ đẹp dịu dàng, sức sống mãnh liệt và những khởi đầu mới, nữ tính mà bản lĩnh như một bậc anh thư.',
      wish: 'Chúc mừng 20/10, Anh Thư! Người ta gọi những người phụ nữ tài giỏi, bản lĩnh là “anh thư”, còn anh đào lại là loài hoa dịu dàng nhất của mùa xuân, và bạn mang trong mình cả hai vẻ đẹp ấy. MindX trân trọng sự tận tụy cùng nụ cười mà bạn mang đến mỗi ngày. Chúc bạn luôn tự tin bước về phía trước, để mỗi chặng đường đi qua đều nở rộ như một mùa hoa.'
    },
    {
      slug: 'phuong-mai',
      photo: 'img/phuong-mai.jpg',
      name: 'Phương Mai',
      flower: 'Hoa mai vàng',
      flowerType: 'apricot',
      palette: { petal: '#FFD54F', petalDeep: '#F9A825', center: '#E65100', glow: '#FFF6D5' },
      tagline: 'Thơm ngát và rực rỡ như mai vàng',
      flowerMeaning: 'Mai vàng là loài hoa của mùa xuân, của may mắn, phú quý và những khởi đầu thuận lợi, thơm ngát như chữ “Phương” trong tên Phương Mai.',
      wish: 'Mỗi khi nhắc đến Phương Mai, chúng mình lại nghĩ đến hương thơm và sắc vàng của hoa mai, loài hoa báo hiệu mùa xuân và may mắn. Sự có mặt của bạn cũng như vậy, luôn mang lại năng lượng tươi mới cho những người xung quanh. Cả nhà MindX chúc bạn một Ngày Phụ nữ Việt Nam thật hạnh phúc, một năm nhiều thuận lợi và bình an. Mong rằng bạn sẽ luôn nở rộ theo cách rực rỡ nhất của riêng mình.'
    },
    {
      slug: 'thu-huong',
      photo: 'img/thu-huong.jpg',
      name: 'Thu Hương',
      flower: 'Hoa sữa',
      flowerType: 'milkflower',
      palette: { petal: '#FBF7E1', petalDeep: '#B9CC86', center: '#93A853', glow: '#F3F7DF' },
      tagline: 'Nồng nàn như hương hoa sữa mùa thu',
      flowerMeaning: 'Hoa sữa là hương thơm đặc trưng của mùa thu Hà Nội, gợi nỗi nhớ dịu dàng và những kỷ niệm khó quên, đúng như “hương thu” trong tên Thu Hương.',
      wish: 'Tháng Mười là mùa thu, và hôm nay MindX muốn gửi những lời chúc dịu dàng nhất đến Thu Hương, người mang trong tên mình hương thơm của mùa thu. Như hương hoa sữa mỗi độ thu về, sự hiện diện của bạn thật nhẹ nhàng nhưng để lại dư vị rất lâu trong lòng mọi người. Chúc bạn luôn bình yên, được nâng niu và trân trọng, không chỉ hôm nay mà mỗi ngày. Mong mùa thu này sẽ mang đến cho bạn thật nhiều điều ngọt ngào.'
    },
    {
      slug: 'kim-dung',
      photo: 'img/kim-dung.jpg',
      name: 'Kim Dung',
      flower: 'Hoa hồng',
      flowerType: 'rose',
      palette: { petal: '#F06292', petalDeep: '#C2185B', center: '#FFD180', glow: '#FDE4EC' },
      tagline: 'Quý như vàng, kiều diễm như hoa hồng',
      flowerMeaning: 'Hoa hồng tượng trưng cho tình yêu, sự trân trọng và vẻ đẹp kiêu sa, một đóa hồng quý như vàng dành tặng Kim Dung.',
      wish: 'Kim Dung thân mến, nếu “kim” là vàng quý thì sự tận tâm và chân thành của bạn chính là điều quý giá mà MindX luôn trân trọng. Như đóa hồng kiêu hãnh, bạn có một vẻ đẹp riêng mà không ai có thể thay thế. Nhân ngày 20/10, chúc bạn luôn tự tin, hạnh phúc và được bao bọc bởi những người yêu thương mình. Mong mọi nỗ lực của bạn đều được đền đáp xứng đáng.'
    },
    {
      slug: 'ngoc-phat',
      photo: 'img/ngoc-phat.jpg',
      name: 'Ngọc Phát',
      flower: 'Hoa sen',
      flowerType: 'lotus',
      palette: { petal: '#F8BBD0', petalDeep: '#EC407A', center: '#FFE066', glow: '#FDEFF4' },
      tagline: 'Sáng trong như ngọc, an yên như sen',
      flowerMeaning: 'Hoa sen là quốc hoa của Việt Nam, biểu tượng của sự thanh khiết, an yên và sức vươn lên bền bỉ, chúc Ngọc Phát luôn sáng trong và phát triển.',
      wish: 'Hôm nay, cả nhà MindX xin gửi đến Ngọc Phát những lời chúc chân thành nhất. Như viên ngọc sáng trong và đóa sen an yên giữa đầm, bạn mang đến cho mọi người cảm giác tin cậy và dễ chịu. Chúc bạn luôn khỏe mạnh, mọi dự định đều phát triển và khởi sắc từng ngày. Mong mỗi ngày đến với bạn đều là một ngày đáng nhớ.'
    },
    {
      slug: 'lan-thanh',
      photo: 'img/lan-thanh.jpg',
      name: 'Lan Thanh',
      flower: 'Hoa ngọc lan',
      flowerType: 'magnolia',
      palette: { petal: '#FFFDF4', petalDeep: '#E3D49F', center: '#B9C95A', glow: '#FBF5E1' },
      tagline: 'Thanh khiết như hương ngọc lan',
      flowerMeaning: 'Hoa ngọc lan trắng tượng trưng cho sự thanh khiết, cao quý và tấm lòng chân thành, hương thơm dịu nhẹ mà bền lâu như cái tên Lan Thanh.',
      wish: 'Có những người khiến không gian quanh mình trở nên dễ chịu chỉ bằng sự thanh lịch và chu đáo, và Lan Thanh là một người như thế. Ngọc lan trắng ngần, hương thơm thanh khiết mà kín đáo, giống như cách bạn nhẹ nhàng đối đãi với mọi người xung quanh. Nhân Ngày Phụ nữ Việt Nam, MindX chúc bạn luôn vui vẻ, an yên và tràn đầy cảm hứng. Cảm ơn bạn vì những điều tốt đẹp mà bạn đã lặng lẽ mang đến.'
    },
    {
      slug: 'my-duyen',
      photo: 'img/my-duyen.jpg',
      name: 'Mỹ Duyên',
      flower: 'Hoa đào',
      flowerType: 'peach',
      palette: { petal: '#F9A8C0', petalDeep: '#E25588', center: '#FFE0A3', glow: '#FFEFF4' },
      tagline: 'Duyên dáng như cánh đào xuân',
      flowerMeaning: 'Hoa đào là sứ giả của mùa xuân, mang ý nghĩa may mắn, sức sống mới và những mối duyên tốt đẹp, xinh tươi và có duyên như Mỹ Duyên.',
      wish: 'Người ta nói gặp được nhau là duyên, và có Mỹ Duyên đồng hành là một cái duyên thật đẹp của cả nhà MindX. Như cánh đào hồng mỗi độ xuân về, bạn mang đến niềm vui và sự tươi mới cho mọi người. Chúc bạn một ngày 20/10 thật rạng rỡ, luôn duyên dáng và tự tin theo cách của riêng mình. Mong mỗi ngày của bạn đều có thêm một lý do để mỉm cười.'
    },
    {
      slug: 'thanh-nhan',
      photo: 'img/thanh-nhan.jpg',
      name: 'Thanh Nhàn',
      flower: 'Hoa baby',
      flowerType: 'gypsophila',
      palette: { petal: '#FFFFFF', petalDeep: '#F3C1D3', center: '#FCE4EC', glow: '#FDF2F6' },
      tagline: 'Nhẹ nhàng, an nhiên như hoa baby',
      flowerMeaning: 'Hoa baby tượng trưng cho sự thuần khiết, tình cảm chân thành và hạnh phúc giản dị, nhẹ nhàng và thanh thản như tên Thanh Nhàn.',
      wish: 'Chúc Thanh Nhàn một ngày 20/10 đúng như cái tên của mình: thật thanh thản và an nhiên giữa những bộn bề cuộc sống. Hoa baby nhỏ xinh, giản dị nhưng luôn khiến mọi bó hoa trở nên trọn vẹn, giống như cách bạn làm cho tập thể của chúng mình thêm ấm áp. Mong bạn luôn tìm được sự cân bằng, những niềm vui bình dị và thật nhiều phút giây yên bình. Cảm ơn bạn vì đã luôn ở đây cùng MindX.'
    }
  ].map((recipient) => Object.freeze({ ...recipient, palette: Object.freeze({ ...recipient.palette }) }));

  const recipientsBySlug = new Map(recipients.map((recipient) => [recipient.slug, recipient]));
  const SLUG_PATTERN = /^[a-z0-9-]{1,40}$/;

  function findRecipient(rawSlug) {
    if (typeof rawSlug !== 'string') return null;
    const slug = rawSlug.trim().toLowerCase();
    if (!SLUG_PATTERN.test(slug)) return null;
    return recipientsBySlug.get(slug) || null;
  }

  app.recipients = Object.freeze(recipients);
  app.findRecipient = findRecipient;
})(window.MindxGift = window.MindxGift || {});


$(document).ready(function () {
    //eventlistener intentionally added to WHOLE document (instad solely to #search)
    // bc of event handling issue with navbar-placeholder and searchbar not working
    // when specifically requesting for searchbar id on doc load
    $(document).on('keyup', '#search', function () { // check if potential keyup event comes from #search->continue
        let query = $(this).val();
        let $resultList = $('#result');
        
        //console.log("Searching for: " + query); zwecks debugging

        if (query.length > 1) {
            $.ajax({
                url: '/backend/controllers/search_controller.php',
                type: 'POST',
                data: { search: query },
                success: function (response) {
                    $resultList.empty().show(); 

                    if (response.success && response.data.length > 0) {
                        response.data.forEach(function (product) {
                            let li = $('<li>').addClass('dropdown-item list-group-item');
                            let link = $('<a>')
                                .attr('href', '/frontend/sites/product.html?id=' + product.product_id)
                                .text(product.name)
                                .addClass('text-decoration-none');
                            
                            li.append(link);
                            $resultList.append(li);
                        });
                    } else {
                        $resultList.append('<li class=\"list-group-item text-muted\">No results found</li>');
                    }
                },
                error: function(xhr, status, error) {
                    console.error("AJAX Error: " + error);
                }
            });
        } else {
            $resultList.empty().hide();
        }
    });

   
});


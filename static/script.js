$(document).ready(function() {
    $('.vote-btn').on('click', function() {
        var llm_id = $(this).closest('.llm-item').data('llm-id');
        var vote_count = $(this).siblings('.vote-count').find('.count');
        var vote_btn = $(this).find('.vote');
        var voted_btn = $(this).find('.voted');
        $.ajax({
            url: `/llms/${llm_id}/vote`,
            method: 'PUT',
            data: {ip_address: '{{ ip_address }}'},
            success: function(response) {
                vote_count.html(parseInt(vote_count.html()) + 1);
                vote_btn.addClass('hide');
                voted_btn.removeClass('hide');
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert(jqXHR.responseJSON.detail);
            }
        });
    });
});

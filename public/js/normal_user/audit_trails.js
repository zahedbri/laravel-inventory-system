
$('#audit_trails').addClass('active');

$('#reservation').daterangepicker( {

    locale: {
        format : 'YYYY-MM-DD'
    },

});

if ( document.getElementById( "audits" ) ) {

    var startDate = $('#reservation').val().slice(0,10) + ' 00:00:00';
    var endDate = $('#reservation').val().slice(12,23) + ' 23:59:59';
    reload_audit(startDate, endDate);

}

$( document ).on('change', '#reservation', function() {

    var startDate = $('#reservation').val().slice(0,10) + ' 00:00:00';
    var endDate =$('#reservation').val().slice(12,23) + ' 23:59:59';
    reload_audit(startDate, endDate);

});

function reload_audit( startDate, endDate ) {

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();

    if ( dd < 10) {

        dd = '0' + dd;

    } 
    
    if ( mm < 10 ) {

        mm = '0' + mm;

    } 

    var date = mm + '-' + dd + '-' +  yyyy;
    var time = today.toLocaleTimeString();

    $( "#audits" ).dataTable().fnDestroy()
    
    var t = $('#audits').DataTable( {
        responsive: true,
        autoWidth:false,
        paging: true,
        lengthChange: false,
        pageLength: 50,
        processing: true,
        serverSide: true,
        searchDelay: 1000,
        dom: 'Bfrtip',
        buttons: [
            {

                extend: 'excel',
                text: 'Save in EXCEL',
                filename: 'audit_trails-' + date + '-'+time,
                exportOptions: {
                    orthogonal: 'export',
                    columns: [0, 1, 2, 3]
                },
                messageTop: 'Date Exported: '+ date +' | '+ time,
                title: 'Provincial Government of Laguna - Inventory System',
                customize: function ( xlsx ) {

                    var sheet = xlsx.xl.worksheets[ 'sheet1.xml' ];
                    var rows = $( 'row c', sheet );
                    $( 'row c[r^="A2"]', sheet ).attr( 's', '52' );
                    var CellColHeaders = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
                    var CellColContent = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',];

                    for ( y=0; y < CellColHeaders.length; y++ ) {

                        $('row:eq(2) c[r^='+CellColHeaders[y]+']', sheet).attr( 's', '27' );//bold with border

                    }

                    for ( i=3; i < rows.length; i++ ) {

                        for ( y=0; y < CellColContent.length; y++ ) {

                            $('row:eq('+i+') c[r^='+CellColContent[y]+']', sheet).attr( 's', '25' );//with border

                        }

                    }

                }

            },
        ],
       
        ajax: {
            url: '/audit-trails/search',
            type: 'POST',
            headers: {
                'X-CSRF-TOKEN': $('meta[name="_token"]').attr('content')
            },
            data:{ "startDate": startDate, "endDate": endDate },
        },
        
        columns: [
            { 
                data: null, 
                sortable: false, 
                render: function (data, type, row, meta) {

                    return meta.row + meta.settings._iDisplayStart + 1;

                }  
            },

            { data: 'updated_at' },
            { data: 'email' },
            { data: 'action' },

        ],

        columnDefs: [{ targets: [ 0, 2, 3 ], orderable: false}],

        language: {

            emptyTable: '<center><span class="label label-danger">NO RECORDS FOUND</span></center>',
            zeroRecords: '<center><span class="label label-danger">NO MATCHING RECORDS FOUND</span></center>'

        },

        order: [[ 1, 'desc']],
        
    });

    t.on( 'order.dt search.dt', function () {

        t.column(0, { search:'applied', order:'applied' }).nodes().each( function (cell, i) {

            cell.innerHTML = i+1;

        });

    }).draw();
    
}
